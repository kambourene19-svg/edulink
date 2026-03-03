import prisma from '../utils/prisma';

export class NotificationService {
    /**
     * Simule l'envoi d'un SMS de confirmation de réservation
     */
    static async sendBookingConfirmationSMS(bookingId: string) {
        try {
            const booking = await prisma.booking.findUnique({
                where: { id: bookingId },
                include: {
                    user: true,
                    schedule: {
                        include: {
                            route: { include: { company: true } },
                            bus: true
                        }
                    }
                }
            });

            if (!booking) {
                console.error(`[SMS ERROR] Booking ${bookingId} not found`);
                return;
            }

            const phone = booking.user.phone;
            const company = booking.schedule.route.company.name;
            const departure = booking.schedule.route.departureCity;
            const arrival = booking.schedule.route.arrivalCity;
            const date = new Date(booking.schedule.departureTime).toLocaleDateString('fr-FR');
            const hour = new Date(booking.schedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const seat = booking.seatNumber;

            const message = `FasoTicket: Confirmation ${company}. Voyage ${departure}-${arrival} le ${date} a ${hour}. Siege #${seat}. Bon voyage!`;

            console.log("------------------------------------------");
            console.log(`[SMS SENDING] TO: ${phone}`);
            console.log(`[SMS CONTENT] ${message}`);
            console.log("------------------------------------------");

            // TODO: Intégrer ici un fournisseur réel (InTouch, AfricasTalking, Twilio)
            // Example: await mySmsProvider.send(phone, message);

            return true;
        } catch (error) {
            console.error('[SMS SERVICE ERROR]', error);
            return false;
        }
    }
}
