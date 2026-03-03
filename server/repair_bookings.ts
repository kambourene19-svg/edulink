import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function repair() {
    try {
        const bookingsToFix = await prisma.booking.findMany({
            where: {
                status: 'PENDING',
                payment: { status: 'SUCCESS' }
            }
        });

        console.log(`Found ${bookingsToFix.length} bookings to fix.`);

        for (const b of bookingsToFix) {
            await prisma.booking.update({
                where: { id: b.id },
                data: {
                    status: 'CONFIRMED',
                    qrCode: `TICKET-${b.id}-${Date.now()}`
                }
            });
            console.log(`Confirmed booking ${b.id}`);
        }

        console.log('Repair complete.');

    } catch (e) {
        console.error('Error during repair:', e);
    } finally {
        await prisma.$disconnect();
    }
}

repair();
