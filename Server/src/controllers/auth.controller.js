import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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