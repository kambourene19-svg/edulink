import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { z } from 'zod';

// Schemas validation
const createCompanySchema = z.object({
    name: z.string().min(2),
    contacts: z.string().optional(),
});

const createBusSchema = z.object({
    plate: z.string().min(2),
    seats: z.number().int().positive(),
    model: z.string().optional(),
    companyId: z.string().uuid(),
});

const createRouteSchema = z.object({
    departureCity: z.string(),
    arrivalCity: z.string(),
    price: z.number().positive(),
    companyId: z.string().uuid(),
});

const createScheduleSchema = z.object({
    departureTime: z.string().datetime(), // ISO string
    routeId: z.string().uuid(),
    busId: z.string().uuid(),
});

/**
 * Créer une compagnie (Super Admin)
 */
export const createCompany = async (req: Request, res: Response) => {
    try {
        const data = createCompanySchema.parse(req.body);
        const company = await prisma.company.create({ data });
        res.status(201).json(company);
    } catch (error: any) {
        res.status(400).json({ error: 'Erreur création compagnie', details: error });
    }
};

/**
 * Ajouter un bus
 */
export const addBus = async (req: Request, res: Response) => {
    try {
        const data = createBusSchema.parse(req.body);
        const { companyId, role } = req.user;

        // Seul un Super Admin peut créer des bus pour n'importe quelle compagnie
        // Un Admin Compagnie ne peut créer des bus que pour SA compagnie
        if (role !== 'SUPER_ADMIN' && data.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès interdit : Vous ne pouvez pas ajouter de ressources à une autre compagnie.' });
        }

        const bus = await prisma.bus.create({ data });
        res.status(201).json(bus);
    } catch (error: any) {
        res.status(400).json({ error: 'Erreur ajout bus', details: error });
    }
};

/**
 * Créer un trajet (Ligne)
 */
export const addRoute = async (req: Request, res: Response) => {
    try {
        const data = createRouteSchema.parse(req.body);
        const { companyId, role } = req.user;

        if (role !== 'SUPER_ADMIN' && data.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès interdit : Vous ne pouvez pas créer de trajets pour une autre compagnie.' });
        }

        const route = await prisma.route.create({ data });
        res.status(201).json(route);
    } catch (error: any) {
        res.status(400).json({ error: 'Erreur création trajet', details: error });
    }
};

/**
 * planifier un voyage (Schedule)
 */
export const addSchedule = async (req: Request, res: Response) => {
    try {
        const { departureTime, routeId, busId } = createScheduleSchema.parse(req.body);
        const { companyId, role } = req.user;

        // SECURITY CHECK (IDOR): Verify ownership of Route and Bus
        const [route, bus] = await Promise.all([
            prisma.route.findUnique({ where: { id: routeId } }),
            prisma.bus.findUnique({ where: { id: busId } })
        ]);

        if (!route || !bus) {
            return res.status(404).json({ error: 'Trajet ou Bus introuvable' });
        }

        if (role !== 'SUPER_ADMIN') {
            if (route.companyId !== companyId || bus.companyId !== companyId) {
                return res.status(403).json({ error: 'Accès interdit : Vous ne pouvez pas utiliser les ressources d\'une autre compagnie.' });
            }
        }

        // Vérifier si le bus est dispo (Simplification pour l'instant)

        const schedule = await prisma.schedule.create({
            data: {
                departureTime: new Date(departureTime),
                routeId,
                busId,
            }
        });
        res.status(201).json(schedule);
    } catch (error: any) {
        res.status(400).json({ error: 'Erreur planification voyage', details: error });
    }
};

/**
 * Obtenir les voyages disponibles (Pour le frontend admin ou mobile)
 */
export const getSchedules = async (req: Request, res: Response) => {
    try {
        const { companyId, role } = req.user;

        // Cloisonnement : Si admin compagnie, ne voir que les siens
        const filter = role === 'SUPER_ADMIN' ? {} : { route: { companyId } };

        const schedules = await prisma.schedule.findMany({
            where: filter,
            include: {
                route: { include: { company: true } },
                bus: true,
            },
            orderBy: { departureTime: 'asc' }
        });
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ error: 'Impossible de récupérer les voyages' });
    }
};

/**
 * Obtenir toutes les compagnies
 */
export const getCompanies = async (req: Request, res: Response) => {
    try {
        const companies = await prisma.company.findMany({
            include: { _count: { select: { buses: true, routes: true } } }
        });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Erreur récupération compagnies' });
    }
};

/**
 * Liste des bus d'une compagnie (ou tous)
 */
export const getBuses = async (req: Request, res: Response) => {
    try {
        const { role, companyId: userCompanyId } = req.user;
        const { companyId } = req.query;

        // Déterminer le filtre
        let finalCompanyId = companyId ? String(companyId) : undefined;

        // Sécurité : Un admin de compagnie est forcé sur ses propres bus
        if (role !== 'SUPER_ADMIN') {
            finalCompanyId = userCompanyId;
        }

        const buses = await prisma.bus.findMany({
            where: finalCompanyId ? { companyId: finalCompanyId } : {},
            include: { company: true }
        });
        res.json(buses);
    } catch (error) {
        res.status(500).json({ error: 'Erreur récupération bus' });
    }
};

/**
 * Supprimer un bus
 */
export const deleteBus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // Vérifier s'il y a des voyages planifiés
        const schedules = await prisma.schedule.count({ where: { busId: id } });
        if (schedules > 0) {
            return res.status(400).json({ error: 'Impossible de supprimer un bus avec des voyages planifiés' });
        }
        await prisma.bus.delete({ where: { id } });
        res.json({ message: 'Bus supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur suppression bus' });
    }
};

/**
 * Liste des trajets d'une compagnie (ou tous)
 */
export const getRoutes = async (req: Request, res: Response) => {
    try {
        const { role, companyId: userCompanyId } = req.user;
        const { companyId } = req.query;

        let finalCompanyId = companyId ? String(companyId) : undefined;

        if (role !== 'SUPER_ADMIN') {
            finalCompanyId = userCompanyId;
        }

        const routes = await prisma.route.findMany({
            where: finalCompanyId ? { companyId: finalCompanyId } : {},
            include: { company: true }
        });
        res.json(routes);
    } catch (error) {
        res.status(500).json({ error: 'Erreur récupération trajets' });
    }
};

/**
 * Supprimer un trajet
 */
export const deleteRoute = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const schedules = await prisma.schedule.count({ where: { routeId: id } });
        if (schedules > 0) {
            return res.status(400).json({ error: 'Impossible de supprimer un trajet lié à des voyages' });
        }
        await prisma.route.delete({ where: { id } });
        res.json({ message: 'Trajet supprimé' });
    } catch (error) {
        res.status(500).json({ error: 'Erreur suppression trajet' });
    }
};
/**
 * Obtenir les statistiques de la compagnie
 */
export const getCompanyStats = async (req: Request, res: Response) => {
    try {
        const { companyId, role } = req.user;

        if (role !== 'SUPER_ADMIN' && !companyId) {
            return res.status(403).json({ error: 'Accès refusé' });
        }

        const filter = role === 'SUPER_ADMIN' ? {} : { schedule: { route: { companyId } } };

        // 1. Revenu Total & Nombre de réservations
        const bookings = await prisma.booking.findMany({
            where: {
                ...filter,
                status: 'CONFIRMED'
            },
            include: {
                payment: true,
                schedule: { include: { route: true, bus: true } }
            }
        });

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.payment?.amount || 0), 0);
        const totalBookings = bookings.length;

        // 2. Taux de remplissage moyen
        // Récupérer les voyages de la compagnie
        const scheduleFilter = role === 'SUPER_ADMIN' ? {} : { route: { companyId } };
        const schedules = await prisma.schedule.findMany({
            where: scheduleFilter,
            include: {
                bus: true,
                _count: { select: { bookings: { where: { status: 'CONFIRMED' } } } }
            }
        });

        let totalSeats = 0;
        let occupiedSeats = 0;

        schedules.forEach(s => {
            totalSeats += s.bus.seats;
            occupiedSeats += s._count.bookings;
        });

        const occupancyRate = totalSeats > 0 ? (occupiedSeats / totalSeats) * 100 : 0;

        // 3. Données de ventes journalières (7 derniers jours)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesByDay: { [key: string]: number } = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            salesByDay[date.toISOString().split('T')[0]] = 0;
        }

        bookings.forEach(b => {
            const dateKey = b.createdAt.toISOString().split('T')[0];
            if (salesByDay[dateKey] !== undefined) {
                salesByDay[dateKey] += b.payment?.amount || 0;
            }
        });

        const chartData = Object.keys(salesByDay).map(date => ({
            date,
            revenue: salesByDay[date]
        })).reverse();

        // 4. Réservations récentes (10 dernières)
        const bookingsData = await prisma.booking.findMany({
            where: filter,
            include: {
                user: {
                    select: {
                        fullName: true,
                        phone: true
                    }
                },
                schedule: {
                    include: {
                        route: { include: { company: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // SECURITY: Mask sensitive PII data before sending to frontend
        const recentBookings = bookingsData.map(b => ({
            ...b,
            user: {
                fullName: b.user.fullName,
                phone: b.user.phone ? `${b.user.phone.substring(0, 4)}****${b.user.phone.substring(b.user.phone.length - 2)}` : 'N/A'
            }
        }));

        res.json({
            kpis: {
                totalRevenue,
                totalBookings,
                occupancyRate: Math.round(occupancyRate * 10) / 10,
                activeSchedules: schedules.length
            },
            chartData,
            recentBookings
        });

    } catch (error) {
        console.error('[STATS ERROR]', error);
        res.status(500).json({ error: 'Erreur lors du calcul des statistiques' });
    }
};

// --- GESTION DES VOYAGES (ADMIN) ---

/**
 * Supprimer un voyage planifié
 */
export const deleteSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { companyId } = req.user;

        // 1. Vérifier si le trajet appartient à la compagnie
        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: { route: true, bookings: true }
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Voyage non trouvé' });
        }

        if (schedule.route.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        // 2. Vérifier s'il y a des réservations
        if (schedule.bookings.length > 0) {
            // Optionnel : On pourrait autoriser la suppression et annuler les billets, 
            // mais pour l'instant on bloque pour éviter les erreurs.
            return res.status(400).json({
                error: `Impossible de supprimer : ${schedule.bookings.length} réservation(s) active(s). Veuillez d'abord annuler les billets.`
            });
        }

        // 3. Supprimer
        await prisma.schedule.delete({ where: { id } });

        res.json({ message: 'Voyage supprimé avec succès' });

    } catch (error) {
        console.error('[DELETE SCHEDULE ERROR]', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};

/**
 * Mettre à jour un voyage (ex: changer l'heure)
 */
export const updateSchedule = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { departureTime, busId } = req.body;
        const { companyId } = req.user;

        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: { route: true }
        });

        if (!schedule || schedule.route.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès non autorisé ou voyage introuvable' });
        }

        const data: any = {};
        if (departureTime) data.departureTime = new Date(departureTime);
        if (busId) data.busId = busId;

        const updated = await prisma.schedule.update({
            where: { id },
            data
        });

        res.json({ message: 'Voyage mis à jour', schedule: updated });

    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
};

/**
 * Mettre à jour une compagnie
 */
export const updateCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, contacts } = req.body; // logoUrl à gérer plus tard avec multer
        const { role, companyId: userCompanyId } = req.user;

        // Vérification des droits
        if (role !== 'SUPER_ADMIN' && userCompanyId !== id) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        const data: any = {};
        if (name) data.name = name;
        if (contacts) data.contacts = contacts;

        const updated = await prisma.company.update({
            where: { id },
            data
        });

        res.json({ message: 'Compagnie mise à jour', company: updated });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la compagnie' });
    }
};

/**
 * Mettre à jour un bus
 */
export const updateBus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { plate, seats, model, companyId } = req.body;
        const { role, companyId: userCompanyId } = req.user;

        const bus = await prisma.bus.findUnique({ where: { id } });

        if (!bus) return res.status(404).json({ error: 'Bus introuvable' });

        // Vérification : Seul le super admin ou l'admin de la compagnie du bus peut modifier
        if (role !== 'SUPER_ADMIN' && userCompanyId !== bus.companyId) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        const data: any = {};
        if (plate) data.plate = plate;
        if (seats) data.seats = Number(seats);
        if (model) data.model = model;
        // Seul un super admin peut changer l'affectation d'un bus à une compagnie
        if (companyId && role === 'SUPER_ADMIN') data.companyId = companyId;

        const updated = await prisma.bus.update({
            where: { id },
            data
        });

        res.json({ message: 'Bus mis à jour', bus: updated });

    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la mise à jour du bus' });
    }
};

/**
 * Basculer le statut d'embarquement (Check-in manuel)
 */
export const toggleCheckIn = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { checkedIn } = req.body; // boolean

        // Idéalement vérifier que l'utilisateur a le droit (Admin compagnie ou Staff)
        // Ici on suppose que le middleware gère l'auth de base + role check global

        const booking = await prisma.booking.update({
            where: { id },
            data: { checkedIn: !!checkedIn }
        });

        res.json({ message: 'Statut mis à jour', booking });
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du check-in' });
    }
};

/**
 * Obtenir les détails d'un voyage (Manifeste)
 */
export const getScheduleById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { companyId, role } = req.user;

        const schedule = await prisma.schedule.findUnique({
            where: { id },
            include: {
                route: { include: { company: true } },
                bus: true,
                bookings: {
                    include: { user: true, payment: true },
                    orderBy: { seatNumber: 'asc' }
                }
            }
        });

        if (!schedule) {
            return res.status(404).json({ error: 'Voyage introuvable' });
        }

        // Vérification accès
        if (role !== 'SUPER_ADMIN' && schedule.route.companyId !== companyId) {
            return res.status(403).json({ error: 'Accès non autorisé' });
        }

        res.json(schedule);
    } catch (error) {
        res.status(500).json({ error: 'Erreur récupération détails voyage' });
    }
};

