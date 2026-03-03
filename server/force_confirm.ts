import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function forceConfirm() {
    try {
        const result = await prisma.booking.updateMany({
            where: { status: 'PENDING' },
            data: {
                status: 'CONFIRMED',
                qrCode: 'REPAIRED-TICKET'
            }
        });

        await prisma.payment.updateMany({
            where: { status: 'PENDING' },
            data: { status: 'SUCCESS' }
        });

        console.log(`Successfully confirmed ${result.count} bookings and their payments.`);
    } catch (e) {
        console.error('Error during force confirm:', e);
    } finally {
        await prisma.$disconnect();
    }
}

forceConfirm();
