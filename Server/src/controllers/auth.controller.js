import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { getPasswordResetMailHtml, getResetPasswordSuccessEmail } from "../utils/utils.js";
import { sendEmail } from "../services/email.service.js";
import config from "../config/config.js";

export const register = async (req, res) => {
    try {

        const { name, email, password , role } = req.body;

        if(!name || !email || !password || !role){
            return res.status(401).json({success: false, message: 'All fields are required'});
        }
        
        const userExists = await User.findOne({ email });
        if(userExists){
            return res.status(401).json({success: false, message: 'User already exists'});
        }
        
        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashPassword,
            role
        });

        await user.save();

        const token = jwt.sign({ id: user._id , role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({success: true, message: 'User created successfully'});
        
    } catch (error) {
        res.status(500).json({ success: false, message: error.message});
    }
}



export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }
        
        if(user.role !== role){
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Invalid Email or Password' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({ success: true, message: 'Login successful'});
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



export const logout = (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });

        return res.status(200).json({success: true, message: 'Logout Successful'});
    }
    catch (error) {
        console.error('Error during logout:', error.message);
        return res.status(500).json({success: false, message: 'Internal server error'});
    }
}



export const sendResetMail = async (req, res) => {
    try {
        const { email } = req.body;

        if(!email){
            return res.status(401).json({success: false, message: 'All fields are required'});
        }

        const user = await User.findOne({ email });
        if(!user){
            return res.status(401).json({success: false, message: 'User not found'});
        }

        // Generate reset token
		const resetToken = crypto.randomBytes(20).toString("hex");
		const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000; // 1 hour

		user.resetPasswordToken = resetToken;
		user.resetPasswordExpiresAt = resetTokenExpiresAt;

		await user.save();

        // Create password reset URL
		const resetUrl = `${config.FRONTEND_URL}/reset-password/${resetToken}`;

		// Send reset email
		await sendEmail(user.email, "Forgot Password", getPasswordResetMailHtml(resetUrl, user.role, user.name));

        res.status(200).json({success: true, message: 'Password reset link has been sent to your email'});
    } catch (error) {
        res.status(500).json({success: false, message: error.message});
    }
}



export const resetPassword = async (req, res) => {
	try {
		const { token } = req.params;
		const { password } = req.body;

		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpiresAt: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(401).json({ success: false, message: "Invalid or expired reset link" });
		}

		// update password
		const hashedPassword = await bcrypt.hash(password, 10);

		user.password = hashedPassword;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpiresAt = undefined;
		await user.save();

		await sendEmail(user.email, "Password Reset Successful", getResetPasswordSuccessEmail(user.role, user.name));

		res.status(200).json({ success: true, message: "Password reset successful" });
	} catch (error) {
		res.status(500).json({ success: false, message: error.message });
	}
};