import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

async function simulateBooking() {
    console.log('--- Démarrage de la simulation de réservation ---');

    try {
        // 1. Recherche de trajet
        console.log('\n1. Recherche de trajet Ouaga -> Bobo...');
        const searchRes = await axios.get(`${API_URL}/bookings/search`, {
            params: { departureCity: 'Ouaga', arrivalCity: 'Bobo' }
        });

        if (searchRes.data.length === 0) {
            console.error('Aucun trajet trouvé. Avez-vous lancé le seed ?');
            return;
        }

        const schedule = searchRes.data[0];
        console.log(`Trajet trouvé: ${schedule.route.departureCity} -> ${schedule.route.arrivalCity} à ${schedule.departureTime}`);
        console.log(`Prix: ${schedule.route.price} FCFA`);
        console.log(`Bus: ${schedule.bus.model} (${schedule.bus.seats} places)`);

        // 2. Création d'un utilisateur (Voyageur)
        console.log('\n2. Création du compte voyageur...');
        const phone = `70${Math.floor(Math.random() * 899999 + 100000)}`;
        const registerRes = await axios.post(`${API_URL}/auth/register`, {
            phone,
            password: 'password123',
            fullName: 'Moussa Ouédraogo'
        });
        const userId = registerRes.data.userId;
        console.log(`Voyageur créé: ${phone} (ID: ${userId})`);

        // 3. Réservation
        console.log('\n3. Tentative de réservation du siège n°5...');
        const bookingRes = await axios.post(`${API_URL}/bookings/book`, {
            scheduleId: schedule.id,
            seatNumber: 5,
            userId: userId,
            paymentMethod: 'ORANGE_MONEY',
            phoneNumber: phone
        });

        const bookingId = bookingRes.data.bookingId;
        console.log(`Réservation initée ! ID: ${bookingId}`);
        console.log(`Statut paiement: ${bookingRes.data.paymentStatus}`);

        // 4. Validation Paiement (Webhook simulation)
        console.log('\n4. Simulation validation paiement (Webhook)...');
        await axios.post(`${API_URL}/bookings/payment-webhook`, {
            bookingId: bookingId,
            status: 'SUCCESS'
        });
        console.log('Paiement validé avec succès.');

        console.log('\n--- Simulation terminée avec SUCCÈS ---');

    } catch (error: any) {
        console.error('\n--- ÉCHEC Simulation ---');
        console.error(error.response ? error.response.data : error.message);
    }
}

simulateBooking();
