import { Router } from "express";
import { getProfile, getUserById, getUsers } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get('/', authMiddleware, getUsers);
userRouter.get('/profile', authMiddleware, getProfile);
userRouter.get('/:id', authMiddleware, getUserById);


export default userRouter;