import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Début du Seed v6 (Réseau Authentique Burkina Faso)...');

    // 1. Nettoyage complet
    await prisma.payment.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.schedule.deleteMany();
    await prisma.bus.deleteMany();
    await prisma.route.deleteMany();
    await prisma.company.deleteMany();

    // 2. Super Admin
    const adminPassword = await argon2.hash('admin123');
    await prisma.user.upsert({
        where: { phone: '00000000' },
        update: {},
        create: {
            phone: '00000000',
            password: adminPassword,
            fullName: 'Stagiaire Admin',
            role: 'SUPER_ADMIN',
        },
    });

    // 2.2 Créer un Gérant TSR pour les tests Web
    const tsrPassword = await argon2.hash('tsr123');
    const tsrManager = await prisma.user.upsert({
        where: { phone: '70253138' },
        update: {},
        create: {
            phone: '70253138',
            password: tsrPassword,
            fullName: 'Gérant TSR',
            role: 'ADMIN_COMPANY',
        },
    });

    // 2.3 Créer un Gérant STAF pour les tests Web
    const stafPassword = await argon2.hash('staf123');
    const stafManager = await prisma.user.upsert({
        where: { phone: '70200000' },
        update: {},
        create: {
            phone: '70200000',
            password: stafPassword,
            fullName: 'Gérant STAF',
            role: 'ADMIN_COMPANY',
        },
    });

    // 3. Les Compagnies Réelles
    const companiesData = [
        { name: 'TSR (Transport Sana Rasmané)', contacts: '70 25 31 38' },
        { name: 'STAF (Aorema et Frères)', contacts: '70 20 00 00' },
        { name: 'Rakieta Transport', contacts: '20 97 00 00' },
        { name: 'Elitis Express', contacts: '25 37 37 37' },
        { name: 'Rahimo Transport', contacts: '70 00 00 01' },
        { name: 'SONEF Transport', contacts: '70 00 00 05' },
    ];

    const companies: any = {};
    for (const data of companiesData) {
        companies[data.name] = await prisma.company.create({ data });
    }

    // Lier les gérants à leurs compagnies
    await prisma.user.update({
        where: { phone: '70253138' },
        data: { companyId: companies['TSR (Transport Sana Rasmané)'].id }
    });
    await prisma.user.update({
        where: { phone: '70200000' },
        data: { companyId: companies['STAF (Aorema et Frères)'].id }
    });

    // 4. Trajets Réels (Source : Recherche terrain & Web)
    const routes = [
        // Axe RN1 (Ouaga - Bobo - Banfora - Niangoloko)
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Bobo-Dioulasso', price: 7000, hours: [7, 8, 9, 10, 11, 14, 16, 22] },
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Bobo-Dioulasso', price: 6000, hours: [6, 8, 10, 12, 14, 16, 20] },
        { company: 'Rakieta Transport', from: 'Ouagadougou', to: 'Bobo-Dioulasso', price: 9000, hours: [10, 14] },
        { company: 'Elitis Express', from: 'Ouagadougou', to: 'Bobo-Dioulasso', price: 10000, hours: [7, 8, 10, 12, 14, 18] },
        { company: 'Rahimo Transport', from: 'Ouagadougou', to: 'Bobo-Dioulasso', price: 6000, hours: [7, 14] },

        { company: 'Rakieta Transport', from: 'Bobo-Dioulasso', to: 'Banfora', price: 1500, hours: [7, 9, 11, 14, 16] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Bobo-Dioulasso', to: 'Banfora', price: 1500, hours: [8, 15] },

        { company: 'Rakieta Transport', from: 'Ouagadougou', to: 'Banfora', price: 8000, hours: [7, 13] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Banfora', price: 8000, hours: [8, 14] },

        // Axe RN2 (Ouaga - Ouahigouya)
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Ouahigouya', price: 3500, hours: [7, 10, 14] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Ouahigouya', price: 3500, hours: [8, 15] },

        // Axe RN4 (Ouaga - Koupela - Fada - Est)
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Fada N\'Gourma', price: 4500, hours: [7, 13] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Fada N\'Gourma', price: 4500, hours: [8, 14] },
        { company: 'SONEF Transport', from: 'Ouagadougou', to: 'Fada N\'Gourma', price: 5000, hours: [10] },

        // Axe RN5 (Ouaga - Pô)
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Pô', price: 3000, hours: [7, 14] },
        { company: 'Rakieta Transport', from: 'Ouagadougou', to: 'Pô', price: 3500, hours: [8] },

        // Axe RN6 (Ouaga - Léo)
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Léo', price: 3500, hours: [7, 15] },

        // Axe RN22 / RN3 (Ouaga - Kaya - Dori)
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Kaya', price: 2000, hours: [8, 14] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Dori', price: 5000, hours: [7] },

        // Sud-Ouest - Gaoua Axis
        { company: 'Rakieta Transport', from: 'Bobo-Dioulasso', to: 'Gaoua', price: 4000, hours: [7, 10, 15] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouagadougou', to: 'Gaoua', price: 8500, hours: [8, 20] },

        // Transversales & Province-Province
        { company: 'TSR (Transport Sana Rasmané)', from: 'Koudougou', to: 'Boromo', price: 1500, hours: [9, 15] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Boromo', to: 'Bobo-Dioulasso', price: 2500, hours: [10, 16] },
        { company: 'STAF (Aorema et Frères)', from: 'Koupéla', to: 'Tenkodogo', price: 1000, hours: [9, 11, 15] },
        { company: 'STAF (Aorema et Frères)', from: 'Fada N\'Gourma', to: 'Koupéla', price: 1500, hours: [7, 14] },
        { company: 'Rakieta Transport', from: 'Banfora', to: 'Niangoloko', price: 1000, hours: [8, 16] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Ouahigouya', to: 'Dédougou', price: 4000, hours: [7] },
        { company: 'TSR (Transport Sana Rasmané)', from: 'Dédougou', to: 'Koudougou', price: 2500, hours: [8, 14] },
        { company: 'STAF (Aorema et Frères)', from: 'Ouagadougou', to: 'Koudougou', price: 2000, hours: [7, 9, 11, 13, 15, 17] },
    ];

    // 5. Injection (Aller et Retour systématique pour le réalisme)
    for (const r of routes) {
        const company = companies[r.company];

        // Créer un Bus fictif par trajet pour simplifier
        const bus = await prisma.bus.create({
            data: {
                plate: `${Math.floor(Math.random() * 99)} PF ${Math.floor(1000 + Math.random() * 9000)}`,
                seats: r.price > 8000 ? 50 : 65,
                model: r.company.includes('Elitis') ? 'VIP Platinum' : 'Yutong Confort',
                companyId: company.id
            }
        });

        // Route Aller
        const routeAller = await prisma.route.create({
            data: {
                departureCity: r.from,
                arrivalCity: r.to,
                price: r.price,
                companyId: company.id
            }
        });

        // Route Retour
        const routeRetour = await prisma.route.create({
            data: {
                departureCity: r.to,
                arrivalCity: r.from,
                price: r.price,
                companyId: company.id
            }
        });

        for (const hour of r.hours) {
            const date = new Date();
            date.setHours(hour, 0, 0, 0);

            // Schedule Aller
            await prisma.schedule.create({
                data: {
                    departureTime: date,
                    routeId: routeAller.id,
                    busId: bus.id,
                    availableSeats: bus.seats
                }
            });

            // Schedule Retour
            const dateRetour = new Date(date);
            dateRetour.setHours(hour + 1, 30, 0, 0); // Décale un peu le retour pour le réalisme
            await prisma.schedule.create({
                data: {
                    departureTime: dateRetour,
                    routeId: routeRetour.id,
                    busId: bus.id,
                    availableSeats: bus.seats
                }
            });
        }
    }

    console.log('✅ Super Seed v6 Terminé avec 100% de trajets REELS burkinabè !');

    // 6. Quelques réservations de test pour le Dashboard
    console.log('📊 Ajout de quelques réservations pour le Dashboard...');
    const schedules = await prisma.schedule.findMany({ take: 5, include: { route: true } });
    for (const s of schedules) {
        await prisma.booking.create({
            data: {
                scheduleId: s.id,
                seatNumber: Math.floor(Math.random() * 20) + 1,
                userId: tsrManager.id, // Utilisateur gérant comme voyageur pour le test
                status: 'CONFIRMED',
                qrCode: `TEST-QR-${s.id}`,
                payment: {
                    create: {
                        amount: s.route.price,
                        method: 'ORANGE_MONEY',
                        status: 'SUCCESS'
                    }
                }
            }
        });
    }
    console.log('✨ Données de test Dashboard ajoutées.');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
