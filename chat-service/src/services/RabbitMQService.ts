import amqp, { Channel } from 'amqplib';
import config from '../config/config';
import { v4 as uuidv4 } from "uuid";

export class RabbitMQService {
    private requestQueue: string = "USER_DETAILS_REQUEST";
    private responseQueue: string = "USER_DETAILS_RESPONSE";
    private correlationMap = new Map();
    private channel!: Channel;

    constructor() {
        this.init();
    }

    private async init() {
        const connection = await amqp.connect(config.msgBrokerUrl!);
        this.channel = await connection.createChannel();

        await this.channel.assertQueue(this.requestQueue);
        await this.channel.assertQueue(this.responseQueue);

        await this.listenForResponses();
    }

    private async listenForResponses() {
        this.channel.consume(       
            this.responseQueue,
            (msg) => {
                if (msg) {
                    const correlationId = msg.properties.correlationId;
                    const user = JSON.parse(msg.content.toString());

                    const callback = this.correlationMap.get(correlationId);
                    if (callback) {
                        callback(user);
                        this.correlationMap.delete(correlationId);
                    }
                }
            },
            {
                noAck: true,
            }
        );
    }

    public async requestUserDetails(userId: string, callback: Function) {
        const correlationId = uuidv4();
        this.correlationMap.set(correlationId, callback);
        this.channel.sendToQueue(
            this.requestQueue,
            Buffer.from(JSON.stringify({ userId })),
            {correlationId},
        )
    }

    public async notifyReceiver(receiverId: string, messageContent: string, senderEmail: string, senderName: string) {
        await this.requestUserDetails(receiverId, async (user: any) => {
            const notificationPayload = {
                type: "MESSAGE_RECEIVED",
                userId: receiverId,
                userEmail: user.email,
                message: messageContent,
                from: senderEmail,
                fromName: senderName,
            };

            try {
                await this.channel.assertQueue(config.queue.notifications);
                this.channel.sendToQueue(
                    config.queue.notifications,
                    Buffer.from(JSON.stringify(notificationPayload)),
                );
            } catch (error) {
                console.error(error);
            }
        })
    }
}