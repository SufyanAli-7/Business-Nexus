import { Router } from "express";
import { getProfile } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get('/profile', authMiddleware, getProfile);


export default userRouter;