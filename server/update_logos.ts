import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const companyLogos: { [key: string]: string } = {
    "TSR (Transport Sana Rasmané)": "https://ui-avatars.com/api/?name=TSR&background=f97316&color=fff&size=512&bold=true",
    "STAF (Aorema et Frères)": "https://ui-avatars.com/api/?name=STAF&background=10b981&color=fff&size=512&bold=true",
    "Rakieta Transport": "https://ui-avatars.com/api/?name=Rakieta&background=ef4444&color=fff&size=512&bold=true",
    "Elitis Express": "https://ui-avatars.com/api/?name=Elitis&background=1e3a8a&color=fff&size=512&bold=true",
    "Rahimo Transport": "https://ui-avatars.com/api/?name=Rahimo&background=8b5cf6&color=fff&size=512&bold=true",
    "SONEF Transport": "https://ui-avatars.com/api/?name=SONEF&background=3b82f6&color=fff&size=512&bold=true"
};

async function updateLogos() {
    try {
        const companies = await prisma.company.findMany();

        for (const company of companies) {
            const logoUrl = companyLogos[company.name] || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random&size=512`;

            await prisma.company.update({
                where: { id: company.id },
                data: { logoUrl }
            });
            console.log(`Updated logo for: ${company.name}`);
        }

        console.log("All logos updated successfully.");
    } catch (error) {
        console.error("Error updating logos:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateLogos();
