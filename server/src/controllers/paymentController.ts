import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../utils/prisma';
import { NotificationService } from '../services/notificationService';

const CINETPAY_SITE_ID = process.env.CINETPAY_SITE_ID;
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;
const BASE_URL = process.env.BASE_URL;

/**
 * Initialise un paiement via CinetPay
 */
export const initiatePayment = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.body;
        const userId = req.user?.userId;

        console.log(`[INITIATE PAYMENT] BookingID: ${bookingId}, UserID: ${userId}`);

        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { schedule: { include: { route: true } }, user: true }
        });

        if (!booking) {
            console.error(`[PAYMENT ERROR] Booking ${bookingId} not found`);
            return res.status(404).json({ error: 'Réservation non trouvée' });
        }

        const transactionId = `FT-${Date.now()}`;
        const amount = booking.schedule.route.price;

        const cleanPhone = booking.user.phone.replace(/\D/g, '');

        const paymentData = {
            apikey: CINETPAY_API_KEY,
            site_id: CINETPAY_SITE_ID,
            transaction_id: transactionId,
            amount: amount,
            currency: "XOF",
            alternative_currency: "",
            description: `Achat ticket FasoTicket - Siège ${booking.seatNumber}`,
            customer_id: userId || "GUEST",
            customer_name: booking.user.fullName || "Client",
            customer_surname: "FasoTicket",
            customer_email: "client@fasoticket.com",
            customer_phone_number: cleanPhone,
            customer_address: "Ouagadougou",
            customer_city: "Ouagadougou",
            customer_country: "BF",
            customer_state: "Kadiogo",
            customer_zip_code: "00226",
            notify_url: `${BASE_URL}/api/payments/webhook`,
            return_url: `${BASE_URL}/api/payments/return`,
            channels: "ALL",
            metadata: JSON.stringify({ bookingId: booking.id }),
            lang: "fr"
        };

        try {
            console.log('[CINETPAY] Attempting real API call...');
            const response = await axios.post('https://api-checkout.cinetpay.com/v2/payment', paymentData, { timeout: 5000 });

            if (response.data.code === '201' || response.data.code === '00') {
                console.log('[CINETPAY SUCCESS]', response.data.data.payment_url);
                await prisma.payment.update({
                    where: { bookingId: booking.id },
                    data: { transactionId: transactionId }
                });

                return res.json({
                    payment_url: response.data.data.payment_url,
                    transaction_id: transactionId,
                    mode: 'REAL'
                });
            } else {
                console.warn('[CINETPAY API WARNING] Code:', response.data.code, 'Message:', response.data.message);
            }
        } catch (apiError: any) {
            console.error('[CINETPAY API ERROR]:', apiError.response?.data || apiError.message);
        }

        const currentHost = req.get('host');
        const protocol = req.headers['x-forwarded-proto'] || req.protocol;
        const computedBaseUrl = process.env.PEER_URL || `${protocol}://${currentHost}`;

        const simulationUrl = `${computedBaseUrl}/pay.html?bookingId=${booking.id}&amount=${amount}&phone=${cleanPhone}&v=${Date.now()}`;

        console.log('[PAYMENT FALLBACK] Internal Simulator URL:', simulationUrl);

        res.json({
            payment_url: simulationUrl,
            transaction_id: transactionId,
            mode: 'SIMULATION',
            warning: 'API CinetPay indisponible (test local), redirection vers le simulateur interne.'
        });

    } catch (error: any) {
        console.error('[GLOBAL PAYMENT ERROR]', error);
        res.status(500).json({
            error: 'Erreur critique lors du traitement du paiement',
            message: error.message
        });
    }
};

/**
 * Webhook pour recevoir les notifications de CinetPay
 */
export const cinetPayWebhook = async (req: Request, res: Response) => {
    try {
        const { cpm_site_id, cpm_trans_id, cpm_resultat, cpm_trans_status } = req.body;

        console.log(`[WEBHOOK RECEIVED] Trans: ${cpm_trans_id}, Result: ${cpm_resultat}, Status: ${cpm_trans_status}`);

        if (cpm_resultat === '00' && cpm_trans_status === 'ACCEPTED') {
            // Paiement réussi
            const payment = await prisma.payment.findFirst({
                where: { transactionId: cpm_trans_id }
            });

            if (payment) {
                await prisma.$transaction([
                    prisma.payment.update({
                        where: { id: payment.id },
                        data: { status: 'SUCCESS' }
                    }),
                    prisma.booking.update({
                        where: { id: payment.bookingId },
                        data: { status: 'CONFIRMED' }
                    })
                ]);
                console.log(`[PAYMENT SUCCESS] Booking ${payment.bookingId} confirmed.`);

                // Envoyer la notification SMS
                await NotificationService.sendBookingConfirmationSMS(payment.bookingId);
            }
        }

        // Toujours répondre 200 à CinetPay
        res.sendStatus(200);

    } catch (error) {
        console.error('[WEBHOOK ERROR]', error);
        res.sendStatus(500);
    }
};
