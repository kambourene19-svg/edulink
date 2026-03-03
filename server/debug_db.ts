import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkDB() {
    try {
        const companyCount = await prisma.company.count();
        const busCount = await prisma.bus.count();
        const routeCount = await prisma.route.count();
        const scheduleCount = await prisma.schedule.count();
        const bookingCount = await prisma.booking.count();
        const userCount = await prisma.user.count();

        console.log('--- Database Stats ---');
        console.log(`Companies: ${companyCount}`);
        console.log(`Buses: ${busCount}`);
        console.log(`Routes: ${routeCount}`);
        console.log(`Schedules: ${scheduleCount}`);
        console.log(`Bookings: ${bookingCount}`);
        console.log(`Users: ${userCount}`);
        console.log('----------------------');

        if (busCount > 0) {
            const buses = await prisma.bus.findMany({ include: { company: true } });
            console.log('Sample Bus:', JSON.stringify(buses[0], null, 2));
        }

    } catch (e) {
        console.error('Error checking DB:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkDB();
