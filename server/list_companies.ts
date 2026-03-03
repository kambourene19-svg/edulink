import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function listCompanies() {
    try {
        const companies = await prisma.company.findMany({
            select: { id: true, name: true }
        });
        console.log(JSON.stringify(companies, null, 2));
    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

listCompanies();
