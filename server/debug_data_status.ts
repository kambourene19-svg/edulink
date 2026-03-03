import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
    const bookings = await prisma.booking.findMany({
        take: 10,
        select: { id: true, status: true, payment: { select: { status: true } } }
    });
    console.log('Bookings in DB:', JSON.stringify(bookings, null, 2));

    const companies = await prisma.company.findMany();
    console.log('Companies in DB count:', companies.length);
}

check();
