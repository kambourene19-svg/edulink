import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkBookings() {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                user: true,
                payment: true,
                schedule: { include: { route: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        console.log('--- Recent Bookings Status ---');
        bookings.forEach(b => {
            console.log(`ID: ${b.id.substring(0, 8)} | Status: ${b.status} | Payment: ${b.payment?.status} | User: ${b.user.phone}`);
        });
        console.log('------------------------------');

    } catch (e) {
        console.error('Error checking bookings:', e);
    } finally {
        await prisma.$disconnect();
    }
}

checkBookings();
