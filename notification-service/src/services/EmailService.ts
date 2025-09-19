import nodemailer from 'nodemailer';
import config from '../config/config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export class EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.SMTP_HOST || "localhost",
            port: config.SMTP_PORT,
            secure: false,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            }

        } as SMTPTransport.Options);
    }

    public async sendEmail(to: string, subject: string, content: string) {
        const mailOptions = {
            from: config.EMAIL_FROM,
            to: to,
            subject: subject,
            html: content,
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log("Email sent: %s", info.messageId);
        } catch (error) {
            console.error("Error sending email:", error);
        }
    }
}