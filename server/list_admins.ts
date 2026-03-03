import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const companies = await prisma.company.findMany();
        console.log('--- Companies ---');
        companies.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}`));

        const users = await prisma.user.findMany({
            where: { role: 'ADMIN_COMPANY' }
        });
        console.log('\n--- Company Admins ---');
        users.forEach(u => console.log(`Phone: ${u.phone}, Name: ${u.fullName}, CompanyId: ${u.companyId}`));

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
