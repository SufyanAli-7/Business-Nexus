import User from "../models/user.model.js";

export const getProfile = async (req, res) => {
    try {
        const id = req.id;
        const role = req.role;
        
        const user = await User.findById(id, role).select("-password");
        
        if (!user) {
            return res.status(404).json({success: false, message: 'User not found'});
        }

        return res.status(200).json({success: true, user});
    }
    catch (error) {
        res.status(500).json({success: false, message: 'Internal server error'});
    }
}