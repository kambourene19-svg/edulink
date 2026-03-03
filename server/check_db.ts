import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkData() {
    try {
        const routeCount = await prisma.route.count();
        const scheduleCount = await prisma.schedule.count();
        const companyCount = await prisma.company.count();

        console.log('--- DB Content ---');
        console.log(`Companies: ${companyCount}`);
        console.log(`Routes: ${routeCount}`);
        console.log(`Schedules: ${scheduleCount}`);

        if (scheduleCount > 0) {
            const sampleSchedule = await prisma.schedule.findFirst({
                include: { route: true }
            });
            console.log('Sample Schedule:', JSON.stringify(sampleSchedule, null, 2));
        }

    } catch (error) {
        console.error('Error checking DB:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
