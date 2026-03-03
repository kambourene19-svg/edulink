import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3001/api';

async function runSimulation() {
    console.log("🚀 Lancement de la simulation du flux FasoTicket...\n");

    try {
        // 1. Trouver un trajet et un siège libre
        const schedule = await prisma.schedule.findFirst({
            include: { route: true, bus: true }
        });

        if (!schedule) {
            console.log("❌ Aucun trajet trouvé en base. Veuillez d'abord créer des données.");
            return;
        }

        console.log(`📍 Trajet trouvé: ${schedule.route.departureCity} -> ${schedule.route.arrivalCity}`);

        // 2. Trouver ou créer un utilisateur
        let user = await prisma.user.findFirst({ where: { phone: '70000000' } });
        if (!user) {
            user = await prisma.user.create({
                data: {
                    phone: '70000000',
                    password: 'password123',
                    fullName: 'Sidiki Traore',
                    nationality: 'Burkinabè',
                    idCardNumber: 'B1234567'
                }
            });
            console.log("👤 Utilisateur test créé: Sidiki Traore");
        }

        // 3. Créer une réservation PENDING
        const seat = Math.floor(Math.random() * 40) + 1;
        const booking = await prisma.booking.create({
            data: {
                seatNumber: seat,
                status: 'PENDING',
                userId: user.id,
                scheduleId: schedule.id,
                payment: {
                    create: {
                        amount: schedule.route.price,
                        method: 'CINETPAY',
                        status: 'PENDING',
                        transactionId: `SIMU-${Date.now()}`
                    }
                }
            },
            include: { payment: true }
        });

        console.log(`🎫 Réservation créée (ID: ${booking.id}) - Siège #${seat} - Statut: PENDING`);
        const transId = booking.payment?.transactionId;

        console.log("\n--- Simulation du Webhook CinetPay ---");

        // 4. Simuler l'appel du Webhook (Succès de paiement)
        // Note: On appelle directement la logique de notification interne pour simplifier la vue console
        const webhookData = {
            cpm_site_id: '5871141',
            cpm_trans_id: transId,
            cpm_resultat: '00',
            cpm_trans_status: 'ACCEPTED'
        };

        console.log("📡 Envoi du webhook de succès à l'API...");

        await axios.post(`${API_URL}/payments/webhook`, webhookData);

        console.log("\n✅ Webhook traité avec succès !");

        // 5. Vérifier le résultat final
        const updatedBooking = await prisma.booking.findUnique({
            where: { id: booking.id }
        });

        console.log(`📊 Nouveau statut du ticket: ${updatedBooking?.status}`);
        console.log("\n✨ Vérifiez les logs du terminal 'npm run dev' pour voir le SMS envoyé !");

    } catch (error: any) {
        console.error("❌ Erreur pendant la simulation:", error.response?.data || error.message);
    } finally {
        await prisma.$disconnect();
    }
}

runSimulation();
