import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const getProfile = async (req, res) => {
    try {
        const id = req.id;
        
        const user = await User.findById(id).select("-password");
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.status(200).json({success: true, user});
    }
    catch (error) {
        res.status(500).json({success: false, message: 'Internal server error'});
    }
}

export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findById(id).select("-password");
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.status(200).json({success: true, user});
    }
    catch (error) {
        res.status(500).json({success: false, message: 'Internal server error'});
    }
}

export const getUsers = async (req, res) => {
    try {
        const { role } = req.query;
        const filter = {};
        
        if (role) {
            filter.role = role;
        }
        
        const users = await User.find(filter).select("-password");
        
        return res.status(200).json({ success: true, users });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const id = req.id;
        const { name, email, location, bio } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: 'Email already in use' });
            }
            user.email = email;
        }

        if (name) user.name = name;
        if (location !== undefined) user.location = location;
        if (bio !== undefined) user.bio = bio;

        if (req.file) {
            const result = await uploadOnCloudinary(req.file.path);
            if (result && result.secure_url) {
                user.avatarUrl = result.secure_url;
            }
        }

        await user.save();

        const updatedUser = await User.findById(id).select("-password");
        return res.status(200).json({ success: true, message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

export const changePassword = async (req, res) => {
    try {
        const id = req.id;
        const { currentPassword, newPassword, confirmNewPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'All password fields are required' });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: 'New passwords do not match' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Incorrect current password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        return res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}