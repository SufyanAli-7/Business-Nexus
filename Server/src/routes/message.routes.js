import { Router } from "express";
import { getConversations, getMessagesBetweenUsers, postMessage } from "../controllers/message.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const messageRouter = Router();

messageRouter.get('/conversations', authMiddleware, getConversations);
messageRouter.get('/:otherUserId', authMiddleware, getMessagesBetweenUsers);
messageRouter.post('/', authMiddleware, postMessage);

export default messageRouter;
