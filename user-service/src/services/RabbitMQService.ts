import amqp, { Channel, Connection } from "amqplib";
import config from "../config/config";
import { User } from "../database";
import { ApiError } from "../utils";

class RabbitMQService {
    private requestQueue = "USER_DETAILS_REQUEST";
    private responseQueue = "USER_DETAILS_RESPONSE";
    private connection!: Connection;
    private channel!: Channel;

    constructor() {
        this.init();
    }

    private async init() {
        this.connection = await amqp.connect(config.msgBrokerUrl!);
        this.channel = await this.connection.createChannel();

        await this.channel.assertQueue(this.requestQueue);
        await this.channel.assertQueue(this.responseQueue);

        await this.listenForRequests();
    }

    private async listenForRequests() {
        this.channel.consume(this.requestQueue, async (msg) => {
            if (msg && msg.content) {
                const { userID } = JSON.parse(msg.content.toString());
                const userDetails = await this.getUserDetails(userID);

                this.channel.sendToQueue(
                    this.responseQueue,
                    Buffer.from(JSON.stringify(userDetails)),
                    { correlationId: msg.properties.correlationId },
                )

                this.channel.ack(msg);
           } 
        });
    }
    private async getUserDetails(userID: string) {
        const userDetails = await User.findById(userID).select("-password");

        if (!userDetails) {
            throw new ApiError(404, "User not found");
        }

        return userDetails;
    }
}

export const rabbitMQService = new RabbitMQService();