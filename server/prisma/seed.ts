import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Nettoyage existant (optionnel)
    await prisma.document.deleteMany();

    const documents = [
        // MATHS - Terminale
        {
            title: 'Étude des fonctions exponentielles',
            description: 'Cours complet sur la fonction exponentielle, limites et dérivées.',
            url: 'https://www.maths-et-tiques.fr/telech/Exp.pdf', // Lien exemple
            subject: 'Mathématiques',
            className: 'Terminale',
            year: 2024,
            type: 'COURSE'
        },
        {
            title: 'Probabilités conditionnelles - Exercices',
            description: 'Feuille d\'exercices type BAC sur les probabilités.',
            url: 'https://www.maths-et-tiques.fr/telech/ProbasCond.pdf',
            subject: 'Mathématiques',
            className: 'Terminale',
            year: 2024,
            type: 'EXERCISE'
        },
        // MATHS - Première
        {
            title: 'Dérivation - Fiche de révision',
            description: 'Rappel des formules de dérivation usuelles.',
            url: 'http://example.com/derivation.pdf',
            subject: 'Mathématiques',
            className: 'Première',
            year: 2023,
            type: 'COURSE'
        },
        // PHYSIQUE - Terminale
        {
            title: 'Mécanique de Newton',
            description: 'Chapitre 1 : Les lois de Newton et applications.',
            url: 'http://example.com/newton.pdf',
            subject: 'Physique-Chimie',
            className: 'Terminale',
            year: 2024,
            type: 'COURSE'
        },
        {
            title: 'TP Titrage pH-métrique',
            description: 'Protocole et correction du TP de chimie.',
            url: 'http://example.com/tp_titrage.pdf',
            subject: 'Physique-Chimie',
            className: 'Terminale',
            year: 2024,
            type: 'CORRECTION'
        },
        // HISTOIRE
        {
            title: 'La Guerre Froide (1947-1991)',
            description: 'Synthèse de cours pour le Bac.',
            url: 'http://example.com/guerre_froide.pdf',
            subject: 'Histoire-Géo',
            className: 'Terminale',
            year: 2024,
            type: 'COURSE'
        },
        // ANGLAIS
        {
            title: 'Vocabulary List - Environment',
            description: 'Key words for the "Technology and Science" topic.',
            url: 'http://example.com/vocab.pdf',
            subject: 'Anglais',
            className: 'Terminale',
            year: 2024,
            type: 'HOMEWORK'
        }
    ];

    // Création de l'admin
    const argon2 = require('argon2');
    const adminPassword = await argon2.hash('admin123');
    try {
        await prisma.user.upsert({
            where: { email: 'admin@test.com' },
            update: {},
            create: {
                email: 'admin@test.com',
                password: adminPassword,
                role: 'ADMIN',
                className: 'Admin'
            }
        });
        console.log('Admin user created/verified: admin@test.com');
    } catch (e) {
        console.warn('Admin creation warning:', e);
    }

    for (const doc of documents) {
        const d = await prisma.document.create({
            data: doc,
        });
        console.log(`Created document with id: ${d.id}`);
    }

    console.log('Seeding finished.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
