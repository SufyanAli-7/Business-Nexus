import { Router } from "express";
import { getProfile, getUserById, getUsers, updateProfile, changePassword } from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const userRouter = Router();

userRouter.get('/', authMiddleware, getUsers);
userRouter.get('/profile', authMiddleware, getProfile);
userRouter.get('/:id', authMiddleware, getUserById);
userRouter.put('/profile', authMiddleware, upload.single('avatar'), updateProfile);
userRouter.put('/change-password', authMiddleware, changePassword);

export default userRouter;