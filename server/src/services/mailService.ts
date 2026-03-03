import nodemailer from 'nodemailer';

/**
 * Service pour l'envoi d'emails (Version Test Ethereal)
 */
export class MailService {
    private static transporter: nodemailer.Transporter | null = null;

    private static async getTransporter() {
        if (!this.transporter) {
            // Pour le test, on crée un compte Ethereal automatique
            // En production, on utilisera les variables d'environnement SMTP

            const testAccount = await nodemailer.createTestAccount();

            this.transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });

            console.log("🔓 [MAIL SERVICE] Test Account created:", testAccount.user);
        }
        return this.transporter;
    }

    /**
     * Envoyer un code de réinitialisation par email
     */
    static async sendResetCode(email: string, code: string) {
        try {
            const transporter = await this.getTransporter();

            const info = await transporter.sendMail({
                from: '"FasoTicket Support" <support@fasoticket.com>',
                to: email,
                subject: "Code de réinitialisation FasoTicket 🚌",
                text: `Votre code de réinitialisation est : ${code}. Il expire dans 15 minutes.`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #2563EB;">Réinitialisation de mot de passe</h2>
                        <p>Vous avez demandé la réinitialisation de votre mot de passe FasoTicket.</p>
                        <p style="font-size: 18px;">Votre code de vérification est :</p>
                        <div style="background-color: #F3F4F6; padding: 15px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1E293B;">
                            ${code}
                        </div>
                        <p>Ce code expirera dans 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #64748B; font-size: 12px;">Ceci est un email automatique de test.</p>
                    </div>
                `,
            });

            console.log("📧 [MAIL SENT] Preview URL: %s", nodemailer.getTestMessageUrl(info));
            return nodemailer.getTestMessageUrl(info);
        } catch (error) {
            console.error("❌ [MAIL ERROR]", error);
            throw new Error("Impossible d'envoyer l'email");
        }
    }
}
