import { Router } from "express";
import { getNotifications, markAllAsRead, markAsRead } from "../controllers/notification.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const notificationRouter = Router();

notificationRouter.get('/', authMiddleware, getNotifications);
notificationRouter.put('/mark-all-read', authMiddleware, markAllAsRead);
notificationRouter.put('/:id/read', authMiddleware, markAsRead);

export default notificationRouter;
