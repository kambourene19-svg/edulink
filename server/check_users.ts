import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('--- Users in DB ---');
        users.forEach(u => console.log(`Phone: ${u.phone}, Role: ${u.role}, PasswordHash: ${u.password.substring(0, 10)}...`));
        console.log('-------------------');
    } catch (e) {
        console.error('Error fetching users:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
