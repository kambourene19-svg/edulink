import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

const USAGE = `
Usage: npx ts-node manage_admins.ts [COMMAND] [ARGS...]

Commandes disponibles:
  - add [PHONE] [NAME] [COMPANY] [PASS] : Ajouter/Mettre à jour un admin
  - list                               : Lister tous les admins par compagnie
  - delete [PHONE]                      : Supprimer un accès admin
  - set-pass [PHONE] [NEW_PASS]         : Modifier le mot de passe d'un admin
`;

async function addAdmin(phone: string, fullName: string, companyName: string, pass: string = "Fasoticket2026!") {
    try {
        let company = await prisma.company.findUnique({ where: { name: companyName } });
        if (!company) {
            console.log(`🏗️ Création de la compagnie "${companyName}"...`);
            company = await prisma.company.create({ data: { name: companyName } });
        }

        const hashedPassword = await argon2.hash(pass);
        const user = await prisma.user.upsert({
            where: { phone },
            update: { role: 'ADMIN_COMPANY', companyId: company.id, fullName },
            create: { phone, fullName, password: hashedPassword, role: 'ADMIN_COMPANY', companyId: company.id }
        });
        console.log(`✅ Admin ${fullName} ajouté/mis à jour pour ${companyName}.`);
    } catch (e) { console.error('❌ Erreur:', e); }
}

async function listAdmins() {
    const companies = await prisma.company.findMany({
        include: { _count: true }
    } as any);

    for (const c of companies) {
        const admins = await prisma.user.findMany({ where: { companyId: c.id, role: 'ADMIN_COMPANY' } });
        console.log(`\n🏢 COMPAGNIE : ${c.name} (ID: ${c.id})`);
        if (admins.length === 0) console.log("  (Aucun admin)");
        admins.forEach(a => console.log(`  - ${a.fullName} [${a.phone}]`));
    }
}

async function deleteAdmin(phone: string) {
    try {
        const user = await prisma.user.findUnique({ where: { phone } });
        if (!user) return console.log("❌ Utilisateur introuvable.");

        await prisma.user.update({
            where: { phone },
            data: { role: 'USER', companyId: null } // On ne supprime pas le compte, on retire juste les droits
        });
        console.log(`✅ Droits admin retirés pour le numéro ${phone}.`);
    } catch (e) { console.error('❌ Erreur:', e); }
}

async function setPass(phone: string, newPass: string) {
    try {
        const hashedPassword = await argon2.hash(newPass);
        await prisma.user.update({
            where: { phone },
            data: { password: hashedPassword }
        });
        console.log(`✅ Mot de passe mis à jour pour ${phone}.`);
    } catch (e) { console.error('❌ Erreur:', e); }
}

async function main() {
    const [cmd, ...args] = process.argv.slice(2);
    switch (cmd) {
        case 'add': await addAdmin(args[0], args[1], args[2], args[3]); break;
        case 'list': await listAdmins(); break;
        case 'delete': await deleteAdmin(args[0]); break;
        case 'set-pass': await setPass(args[0], args[1]); break;
        default: console.log(USAGE);
    }
    await prisma.$disconnect();
}

main();
