import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

const searchSchema = z.object({
    departureCity: z.string(),
    arrivalCity: z.string(),
    date: z.string().optional(), // YYYY-MM-DD
});

const bookSeatSchema = z.object({
    scheduleId: z.string().uuid(),
    seatNumber: z.number().int().positive(),
    userId: z.string().uuid(),
    paymentMethod: z.enum(['ORANGE_MONEY', 'MOOV_MONEY', 'CASH', 'CINETPAY']),
    phoneNumber: z.string().min(8), // Pour le paiement
});

/**
 * Rechercher des trajets
 */
export const searchSchedules = async (req: Request, res: Response) => {
    try {
        const { departureCity, arrivalCity, date } = searchSchema.parse(req.query);

        // SQLite does not support mode: 'insensitive', so we use simple matching
        // But we want it to be a bit more flexible (e.g. Ouaga matching Ouagadougou)
        const whereClause: any = {
            route: {
                departureCity: { contains: departureCity },
                arrivalCity: { contains: arrivalCity },
            }
        };

        if (date) {
            const searchDate = new Date(date);
            const nextDay = new Date(searchDate);
            nextDay.setDate(searchDate.getDate() + 1);

            whereClause.departureTime = {
                gte: searchDate,
                lt: nextDay,
            };
        }

        const schedules = await prisma.schedule.findMany({
            where: whereClause,
            include: {
                route: { include: { company: true } },
                bus: true,
                bookings: { select: { seatNumber: true } } // Pour savoir quelles places sont prises
            },
            orderBy: { departureTime: 'asc' }
        });

        // Transformer pour le client (indiquer les places prises)
        const results = schedules.map(s => ({
            ...s,
            takenSeats: s.bookings.map(b => b.seatNumber)
        }));

        res.json(results);
    } catch (error: any) {
        res.status(400).json({ error: 'Erreur recherche', details: error });
    }
};

/**
 * Réserver un siège
 */
export const bookSeat = async (req: Request, res: Response) => {
    try {
        const { scheduleId, seatNumber, paymentMethod, phoneNumber } = bookSeatSchema.parse(req.body);

        // SECURITY: If user is logged in, use their ID. If not (Guest), we might need a different flow.
        // For now, we enforce login or handle guest gracefully.
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ error: 'Vous devez être connecté pour réserver.' });
        }

        // 1. Vérifier disponibilité (Double check)
        // ... (rest of the logic remains the same but uses the verified userId)
        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

        const existingBooking = await prisma.booking.findFirst({
            where: {
                scheduleId,
                seatNumber,
                status: { not: 'CANCELLED' }
            }
        });

        if (existingBooking) {
            if (existingBooking.status === 'CONFIRMED') {
                return res.status(409).json({ error: 'Ce siège est déjà réservé (Paiement validé)' });
            }

            const isOld = existingBooking.createdAt < tenMinutesAgo;
            const isSameUser = existingBooking.userId === userId;

            if (!isOld && !isSameUser) {
                return res.status(409).json({ error: 'Ce siège est en cours de paiement par un autre voyageur. Réessayez dans 10 min.' });
            }

            await prisma.booking.delete({ where: { id: existingBooking.id } });
        }

        // 2. Récupérer le prix du trajet
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: { route: true }
        });

        if (!schedule) return res.status(404).json({ error: 'Trajet non trouvé' });
        const amount = schedule.route.price;

        const booking = await prisma.booking.create({
            data: {
                scheduleId,
                seatNumber,
                userId,
                status: 'PENDING',
                payment: {
                    create: {
                        amount: amount,
                        method: paymentMethod,
                        status: 'PENDING'
                    }
                }
            }
        });

        const paymentUrl = `${process.env.PEER_URL}/pay.html?bookingId=${booking.id}&amount=${amount}&phone=${phoneNumber}&v=${Date.now()}`;

        res.status(201).json({
            message: 'Réservation initiée, redirection vers le paiement',
            bookingId: booking.id,
            paymentStatus: 'PENDING',
            amount,
            paymentUrl
        });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Ce siège est déjà réservé (concurrence)' });
        }
        res.status(400).json({ error: 'Erreur réservation', details: error });
    }
};

/**
 * Webhook de paiement (Simulation)
 */
export const paymentWebhook = async (req: Request, res: Response) => {
    const { bookingId, status, secret } = req.body;

    // SECURITY: Verify webhook secret
    const expectedSecret = process.env.WEBHOOK_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
        console.warn(`[SECURITY ALERT] Unauthorized webhook attempt for booking ${bookingId}`);
        return res.status(401).json({ error: 'Unauthorized: Invalid webhook secret' });
    }

    console.log(`[PAYMENT WEBHOOK] Received for Booking: ${bookingId}, Status: ${status}`);

    try {
        if (status === 'SUCCESS') {
            const booking = await prisma.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CONFIRMED',
                    qrCode: `TICKET-${bookingId}-${Date.now()}`,
                    payment: { update: { status: 'SUCCESS' } }
                },
                include: { user: true, schedule: { include: { route: { include: { company: true } } } } }
            });

            console.log(`[PAYMENT SUCCESS] Booking ${bookingId} is now CONFIRMED`);

            // --- SIMULATION NOTIFICATIONS PREMIUM ---
            const passengerName = booking.user.fullName;
            const departureCity = booking.schedule.route.departureCity;
            const arrivalCity = booking.schedule.route.arrivalCity;
            const companyName = booking.schedule.route.company.name;
            const seatNumber = booking.seatNumber;
            const departureTime = new Date(booking.schedule.departureTime).toLocaleString('fr-FR');

            // 1. Simulation SMS
            console.log(`\n📱 [SMS NOTIFICATION] To: ${booking.user.phone}`);
            console.log(`FasoTicket: Bonjour ${passengerName}, votre ticket ${companyName} pour ${arrivalCity} le ${departureTime} est confirmé. Siège N°${seatNumber}. Bon voyage !\n`);

            // 2. Simulation Email
            if (booking.user.email) {
                console.log(`📧 [EMAIL NOTIFICATION] To: ${booking.user.email}`);
                console.log(`Subject: Confirmation de votre réservation FasoTicket - ${bookingId.slice(0, 8)}`);
                console.log(`Contenu: Cher(e) ${passengerName},\nVotre paiement pour le trajet ${departureCity} -> ${arrivalCity} avec ${companyName} a été validé.\nVous pouvez retrouver votre ticket dans l'application mobile.\nL'équipe FasoTicket.\n`);
            }
        } else {
            console.log(`[PAYMENT FAILED/PENDING] Status: ${status} for Booking: ${bookingId}`);
        }
    } catch (error) {
        console.error(`[WEBHOOK ERROR] Error updating booking ${bookingId}:`, error);
        return res.status(500).json({ error: 'Internal server error during webhook' });
    }

    res.json({ received: true });
};

/**
 * Historique des réservations d'un utilisateur
 */
export const getUserBookings = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.user;
        const { phone } = req.query;

        // SECURITY: If not admin, you can only see YOUR bookings.
        // We fetch the user's current bookings based on their userId from token.
        const bookings = await prisma.booking.findMany({
            where: {
                userId: userId,
                status: 'CONFIRMED'
            },
            include: {
                schedule: {
                    include: {
                        route: { include: { company: true } },
                        bus: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Erreur historique', details: error });
    }
};

/**
 * Obtenir le manifeste (liste des passagers) d'un voyage
 */
export const getScheduleManifest = async (req: Request, res: Response) => {
    try {
        const { scheduleId } = req.params;
        const { companyId, role } = req.user;

        // 1. Récupérer le voyage et vérifier l'appartenance
        const schedule = await prisma.schedule.findUnique({
            where: { id: scheduleId },
            include: {
                route: true,
                bus: true,
                bookings: {
                    where: { status: 'CONFIRMED' },
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                phone: true,
                                nationality: true,
                                idCardNumber: true
                            }
                        }
                    },
                    orderBy: { seatNumber: 'asc' }
                }
            }
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }

        // 2. Sécurité : Vérifier si l'utilisateur a le droit de voir ce manifeste
        if (role === 'ADMIN_COMPANY' && schedule.route.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès refusé : ce voyage appartient à une autre compagnie' });
        }

        res.json({
            schedule: {
                departureTime: schedule.departureTime,
                route: `${schedule.route.departureCity} ➔ ${schedule.route.arrivalCity}`,
                bus: schedule.bus.plate,
                totalSeats: schedule.bus.seats,
                confirmedCount: schedule.bookings.length
            },
            passengers: schedule.bookings.map(b => ({
                seat: b.seatNumber,
                name: b.user.fullName,
                phone: b.user.phone,
                idCard: b.user.idCardNumber,
                nationality: b.user.nationality,
                ticketId: b.id
            }))
        });

    } catch (error) {
        console.error('[MANIFEST ERROR]', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du manifeste' });
    }
};

/**
 * Annuler une réservation
 */
export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const { role, companyId } = req.user;

        // 1. Récupérer la réservation
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                user: true,
                schedule: {
                    include: {
                        route: { include: { company: true } }
                    }
                }
            }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        // 2. Vérification de sécurité (Droit d'annuler)
        // Seul le PROPRIÉTAIRE du billet ou un ADMIN de la compagnie peut annuler
        const isOwner = booking.userId === req.user.id;
        const isCompanyAdmin = role === 'ADMIN_COMPANY' && booking.schedule.route.companyId === companyId;
        const isSuperAdmin = role === 'SUPER_ADMIN';

        if (!isOwner && !isCompanyAdmin && !isSuperAdmin) {
            console.warn(`[SECURITY ALERT] Unauthorized cancellation attempt by user ${req.user.id} for booking ${bookingId}`);
            return res.status(403).json({ error: 'Accès refusé : vous n\'avez pas le droit d\'annuler ce billet' });
        }

        // 3. Effectuer l'annulation
        // On passe le statut à CANCELLED et on met à jour le paiement
        await prisma.$transaction([
            prisma.booking.update({
                where: { id: bookingId },
                data: { status: 'CANCELLED' }
            }),
            prisma.payment.updateMany({
                where: { bookingId: bookingId },
                data: { status: 'REFUNDED' } // Ou FAILED/CANCELLED selon le workflow
            })
        ]);

        console.log(`[CANCELLATION] Booking ${bookingId} has been CANCELLED and seat ${booking.seatNumber} is now free.`);

        // --- SIMULATION NOTIFICATIONS ANNULATION ---
        const passengerName = booking.user.fullName;
        const departureCity = booking.schedule.route.departureCity;
        const arrivalCity = booking.schedule.route.arrivalCity;
        const companyName = booking.schedule.route.company.name;
        const refundAmount = booking.schedule.route.price;

        // 1. Simulation SMS Annulation
        console.log(`\n📱 [SMS NOTIFICATION] To: ${booking.user.phone}`);
        console.log(`FasoTicket: Bonjour ${passengerName}, votre ticket ${companyName} (${departureCity}-${arrivalCity}) a été annulé. Un remboursement de ${refundAmount} FCFA a été initié sur votre compte orange money. À bientôt !\n`);

        // 2. Simulation Email Annulation
        if (booking.user.email) {
            console.log(`📧 [EMAIL NOTIFICATION] To: ${booking.user.email}`);
            console.log(`Subject: Annulation et Remboursement FasoTicket - ${bookingId.slice(0, 8)}`);
            console.log(`Contenu: Cher(e) ${passengerName},\nNous vous confirmons l'annulation de votre trajet ${departureCity} -> ${arrivalCity} avec ${companyName}.\nVotre remboursement de ${refundAmount} FCFA est en cours de traitement.\nL'équipe FasoTicket.\n`);
        }

        res.json({ message: 'Réservation annulée avec succès', bookingId });

    } catch (error) {
        console.error('[CANCEL ERROR]', error);
        res.status(500).json({ error: 'Erreur lors de l\'annulation' });
    }
};

/**
 * Valider un ticket (Check-in)
 */
export const validateTicket = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;
        const { companyId, role } = req.user;

        // 1. Récupérer la réservation
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { user: true, schedule: { include: { route: true } } }
        });

        if (!booking) {
            return res.status(404).json({ error: 'Ticket non trouvé' });
        }

        // 2. Sécurité : Vérifier si le contrôleur appartient à la bonne compagnie
        if (role === 'ADMIN_COMPANY' && booking.schedule.route.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès refusé : ce ticket appartient à une autre compagnie' });
        }

        // 3. Vérifier le statut
        if (booking.status !== 'CONFIRMED') {
            return res.status(400).json({ error: `Ticket invalide (Statut: ${booking.status})` });
        }

        if (booking.checkedIn) {
            return res.status(400).json({ error: 'Ce ticket a déjà été validé (fraude potentielle)' });
        }

        // 4. Marquer comme validé
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { checkedIn: true }
        });

        res.json({
            message: 'Check-in réussi. Passager autorisé.',
            passenger: booking.user.fullName,
            seat: booking.seatNumber,
            route: `${booking.schedule.route.departureCity} ➔ ${booking.schedule.route.arrivalCity}`
        });

    } catch (error) {
        console.error('[VALIDATION ERROR]', error);
        res.status(500).json({ error: 'Erreur lors de la validation du ticket' });
    }
};
