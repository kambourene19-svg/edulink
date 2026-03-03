import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const officialLogos: { [key: string]: string } = {
    "TSR (Transport Sana Rasmané)": "https://tsr-transports.com/wp-content/uploads/2021/11/logo-tsr.png",
    "STAF (Aorema et Frères)": "https://staf-burkina.com/wp-content/uploads/2020/09/cropped-logo-staf.png",
    "Rakieta Transport": "https://i.ibb.co/vYm6FvD/rakieta-logo.png", // Fallback sur une source stable
    "Elitis Express": "https://elitisexpress.com/wp-content/themes/elitis/assets/img/logo-elitis.png",
    "Rahimo Transport": "https://rahimo.bf/wp-content/uploads/2021/05/cropped-logo-rahimo.png",
    "SONEF Transport": "https://sonef.net/wp-content/uploads/2022/01/logo-sonef.png"
};

async function updateOfficialLogos() {
    try {
        const companies = await prisma.company.findMany();

        for (const company of companies) {
            const logoUrl = officialLogos[company.name];

            if (logoUrl) {
                await prisma.company.update({
                    where: { id: company.id },
                    data: { logoUrl }
                });
                console.log(`Updated to official logo for: ${company.name}`);
            } else {
                console.log(`No official logo URL mapped for: ${company.name}, keeping existing or avatar.`);
            }
        }

        console.log("Process completed.");
    } catch (error) {
        console.error("Error updating logos:", error);
    } finally {
        await prisma.$disconnect();
    }
}

updateOfficialLogos();
