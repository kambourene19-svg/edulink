import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function createAdmin(phone: string, fullName: string, companyName: string) {
    try {
        console.log(`\n🚀 Création de l'accès pour ${fullName} (${companyName})...`);

        // 1. Trouver ou créer la compagnie
        let company = await prisma.company.findUnique({ where: { name: companyName } });
        if (!company) {
            console.log(`🏗️ La compagnie "${companyName}" n'existe pas. Création en cours...`);
            company = await prisma.company.create({
                data: { name: companyName }
            });
            console.log(`✅ Compagnie créée avec l'ID: ${company.id}`);
        } else {
            console.log(`🏢 Compagnie trouvée: ${company.name} (ID: ${company.id})`);
        }

        // 2. Créer ou mettre à jour l'utilisateur
        const hashedPassword = await argon2.hash("Fasoticket2026!"); // Mot de passe par défaut

        const user = await prisma.user.upsert({
            where: { phone },
            update: {
                role: 'ADMIN_COMPANY',
                companyId: company.id,
                fullName: fullName
            },
            create: {
                phone,
                fullName,
                password: hashedPassword,
                role: 'ADMIN_COMPANY',
                companyId: company.id
            }
        });

        console.log(`\n✨ SUCCÈS ! ✨`);
        console.log(`👤 Admin : ${user.fullName}`);
        console.log(`📱 Téléphone : ${user.phone}`);
        console.log(`🔑 Mot de passe : Fasoticket2026! (À changer par l'admin)`);
        console.log(`🏰 Compagnie : ${company.name}`);
        console.log(`🔐 Cloisonnement activé : OUI`);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// RÉGLAGES ICI : Téléphone, Nom Complet, Nom de la Compagnie
const args = process.argv.slice(2);
if (args.length < 3) {
    console.log('Usage: npx ts-node create_company_admin.ts [TELEPHONE] [NOM_COMPLET] [NOM_COMPAGNIE]');
} else {
    createAdmin(args[0], args[1], args[2]);
}
