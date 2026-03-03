import { Request, Response } from 'express';
import prisma from '../utils/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const { companyId, role } = req.user;

        // Filtre de base : si c'est un gérant, on restreint à sa compagnie
        const whereClause: any = {};
        if (role === 'ADMIN_COMPANY' && companyId) {
            whereClause.schedule = {
                route: {
                    companyId: companyId
                }
            };
        }

        // Exécution en parallèle pour plus de rapidité
        const [totalTickets, payments, recentBookings] = await Promise.all([
            // 1. Total Tickets (Confirmés)
            prisma.booking.count({
                where: { ...whereClause, status: 'CONFIRMED' }
            }),

            // 2. Chiffre d'Affaires (CA)
            prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'SUCCESS',
                    booking: whereClause
                }
            }),

            // 3. Réservations récentes + Données KYC
            prisma.booking.findMany({
                where: whereClause,
                include: {
                    user: {
                        select: {
                            fullName: true,
                            phone: true,
                            nationality: true,
                            idCardNumber: true
                        }
                    },
                    schedule: {
                        include: {
                            route: { include: { company: true } },
                            bus: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            })
        ]);

        // Enrichissement avec détection de fraude / KYC
        const enrichedBookings = await Promise.all((recentBookings as any[]).map(async (b: any) => {
            // Simulation de vérification croisée
            const otherNumbers = await prisma.user.count({
                where: { idCardNumber: b.user.idCardNumber, phone: { not: b.user.phone } }
            });

            const otherIDs = await prisma.user.count({
                where: { phone: b.user.phone, idCardNumber: { not: b.user.idCardNumber } }
            });

            // Score de risque (0 = Sûr, 100 = Très Suspect)
            let riskScore = 0;
            let securityNotes = [];

            if (otherNumbers > 0) {
                riskScore += 40;
                securityNotes.push(`${otherNumbers} autres numéros liés à cette pièce d'identité`);
            }
            if (otherIDs > 0) {
                riskScore += 50;
                securityNotes.push(`${otherIDs} pièces d'identité différentes pour ce numéro`);
            }
            if (!b.user.idCardNumber) {
                riskScore += 30;
                securityNotes.push("Pièce d'identité manquante");
            }

            // Simulation de scan réseaux sociaux (Mock)
            const socialProfiles = b.user.socialMedia ? b.user.socialMedia.split(',') : [
                `facebook.com/bf.${b.user.phone}`,
                `whatsapp.me/${b.user.phone}`
            ];

            return {
                ...b,
                security: {
                    riskScore: Math.min(riskScore, 100),
                    notes: securityNotes,
                    socialProfiles,
                    isSuspicious: riskScore > 40
                }
            };
        }));

        // 4. Historique de ventes (7 derniers jours) pour le graphique
        const salesHistory = await Promise.all([...Array(7)].map(async (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            date.setHours(0, 0, 0, 0);

            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);

            const daySales = await prisma.payment.aggregate({
                _sum: { amount: true },
                where: {
                    status: 'SUCCESS',
                    createdAt: { gte: date, lt: nextDay },
                    booking: whereClause
                }
            });

            return {
                day: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: date.toISOString().split('T')[0],
                amount: daySales._sum.amount || 0
            };
        }));

        res.json({
            stats: {
                totalTickets,
                revenue: payments._sum.amount || 0,
            },
            recentBookings: enrichedBookings,
            salesHistory
        });

    } catch (error) {
        console.error('[STATS ERROR]', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
    }
};
