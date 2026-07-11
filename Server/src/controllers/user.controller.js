import User from "../models/user.model.js";

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