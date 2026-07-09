import { Router } from "express";
import { login, logout, register, resetPassword, sendResetMail } from "../controllers/auth.controller.js";

const authRouter = Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);

authRouter.post('/forgot-password', sendResetMail);
authRouter.post('/reset-password', resetPassword);

export default authRouter;