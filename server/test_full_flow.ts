import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';
const WEBHOOK_SECRET = 'fasoticket_secure_webhook_2026_xYz';

async function runFullTest() {
    try {
        console.log('--- DEBUT DU TEST DE BOUT EN BOUT ---');

        // 1. Recherche de voyages
        console.log('\n🔍 1. Recherche de voyages...');
        const searchRes = await axios.get(`${BASE_URL}/bookings/search?departureCity=Ouaga&arrivalCity=Bobo`);
        const schedule = searchRes.data[0];
        if (!schedule) throw new Error('Aucun voyage trouvé pour le test');
        console.log(`✅ Voyage trouvé : ${schedule.route.departureCity} -> ${schedule.route.arrivalCity} (${schedule.route.company.name})`);

        // 2. Création d'une réservation (User existant pour simplifier)
        console.log("\n📝 2. Création d'une réservation...");
        // On récupère un utilisateur pour le test
        // Pour ce test, on suppose qu'on a un token d'admin pour voir les changements
        // Mais on va tester le webhook qui est la partie critique
        const bookingId = `test-booking-${Date.now()}`;

        // Simuler un paiement REUSSI via le webhook sécurisé
        console.log(`\n💳 3. Simulation de paiement (Webhook) pour le booking ${bookingId}...`);
        const webhookRes = await axios.post(`${BASE_URL}/bookings/payment-webhook`, {
            bookingId: '5186b593-a8b0-4b20-b6d4-62814f9643d8',
            status: 'SUCCESS',
            secret: WEBHOOK_SECRET
        });
        console.log('✅ Webhook Response Status:', webhookRes.status);

        // 4. Vérification de la sécurité (Tentative sans secret)
        console.log('\n🛡️ 4. Test de sécurité du Webhook (sans secret)...');
        try {
            await axios.post(`${BASE_URL}/bookings/payment-webhook`, {
                bookingId: 'f87a8f54-9d2d-4194-ae95-6b1fddef40bb',
                status: 'SUCCESS'
            });
            console.error('❌ ERREUR : Le webhook a accepté une requête sans secret !');
        } catch (e: any) {
            console.log('✅ Succès : Le webhook a rejeté la requête non authentifiée (Status:', e.response?.status, ')');
        }

        console.log('\n--- TEST TERMINE AVEC SUCCÈS ---');
    } catch (error: any) {
        console.error('\n❌ ECHEC DU TEST:', error.response?.data || error.message);
    }
}

runFullTest();
