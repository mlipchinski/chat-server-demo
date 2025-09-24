import { Router } from "express";
import { authMiddleware } from "../middleware";
import { getConversation, sendMessage } from "../controllers/MessageController";
import { getPromMetrics } from "../controllers/PromController";

export const messageRoutes = Router();

// @ts-ignore
messageRoutes.post('/send', authMiddleware, sendMessage);
messageRoutes.post('/get/:receiverId',
    // @ts-ignore
    authMiddleware,
    getConversation
);

//Prometheus metrics
messageRoutes.get('/metrics', getPromMetrics);