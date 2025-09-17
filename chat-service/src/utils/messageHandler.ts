import { RabbitMQService } from "../services/RabbitMQService";
import { UserStatusStore } from "./userStatusStore";

const userStatusStore = UserStatusStore.getInstance();

export const handleMessageReceived = async (
    senderName: string,
    senderEmail: string,
    receivedId: string,
    messageContent: string
) => {
    if (!userStatusStore.isUserOnline(receivedId)) {
        let rabbitMQService = new RabbitMQService();

        await rabbitMQService.notifyReceiver(
            receivedId,
            messageContent,
            senderEmail,
            senderName
        )
    }
};