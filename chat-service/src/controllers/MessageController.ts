import { IAuthRequest } from "../middleware";
import { Response } from "express";
import { ApiError, handleMessageReceived } from "../utils";
import { Message } from "../database";

export const sendMessage = async (req: IAuthRequest, res: Response) => {
    try {
        const { receiverId, message } = req.body;
        const { _id, email, name } = req.user;

        validateReceiver(_id, receiverId);

        const newMessage = await Message.create({
            senderId: _id,
            receiverId: receiverId,
            message,
        });

        await handleMessageReceived(name, email, receiverId, message);

        return res.json({
            status: 200,
            message: "Message sent successfully",
            data: newMessage,
        });
    } catch (error: any) {
        return res.json({
            status: 500,
            message: error.message,
        });
    }
};

export const getConversation = async (req: IAuthRequest, res: Response) => {
    try {
        const { receivedId } = req.params;
        const senderId = req.user._id;

        const messages = await Message.find({
            $or: [
                { senderId, receivedId, },
                { senderId: receivedId, receiverId: senderId },
            ]
        });

        return res.json({
            status: 200,
            message: "Message retrieved successfully",
            data: messages,
        });

    } catch (error: any) {
        return res.json({
            status: 500,
            message: error.message,
        });
    }  
};

const validateReceiver = (senderId: string, receiverId: string) => {
    if (!receiverId) {
        throw new ApiError(404, "Receiver ID is required");
    }

    if (senderId == receiverId) {
        throw new ApiError(400, "Sender and receiver sannot be the same");
    }
}