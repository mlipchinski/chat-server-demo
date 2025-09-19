import amqp, { Channel } from "amqplib";
import { EmailService } from "./EmailService";
import { UserStatusStore } from "../utils";
import config from "../config/config";

export class RabbitMQService {
    private channel!: Channel;
    private emailService = new EmailService();
    private userStatusStore = UserStatusStore.getInstance();

    constructor() {
        this.init();
    }

    private async init() {
        const connection = await amqp.connect(config.msgBrokerUrl!);
        this.channel = await connection.createChannel();

        await this.consumeNotification();
    }

    private async consumeNotification() {
        await this.channel.assertQueue(config.queue.notifications);
        this.channel.consume(config.queue.notifications, async (msg) => {
            if (msg) {
                const {
                    type,
                    userId,
                    message,
                    userEmail,
                    userToken,
                    fromName,
                } = JSON.parse(msg.content.toString());

                if (type === "MESSAGE_RECEIVED") {
                    const isUserOnline = this.userStatusStore.isUserOnline(userId);

                    if (!isUserOnline || !userToken) {
                        if (userEmail) {
                            await this.emailService.sendEmail(userEmail, `New Message from ${fromName}`, message);
                        } 
                    }
                }
                this.channel.ack(msg);
            }
        });
    }
}