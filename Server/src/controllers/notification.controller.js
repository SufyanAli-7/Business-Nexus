import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const getNotifications = async (req, res) => {
    try {
        const userId = req.id;

        let notifications = await Notification.find({ recipientId: userId })
            .populate("senderId", "name avatarUrl")
            .sort({ createdAt: -1 });

        if (notifications.length === 0) {
            const otherUsers = await User.find({ _id: { $ne: userId } }).limit(2);
            if (otherUsers.length > 0) {
                const u1 = otherUsers[0];
                const u2 = otherUsers[1] || u1;

                const defaultSeeds = [
                    {
                        recipientId: userId,
                        senderId: u1._id,
                        type: "message",
                        content: "sent you a message about your startup",
                        unread: true
                    },
                    {
                        recipientId: userId,
                        senderId: u2._id,
                        type: "connection",
                        content: "accepted your connection request",
                        unread: true
                    },
                    {
                        recipientId: userId,
                        senderId: u1._id,
                        type: "investment",
                        content: "showed interest in investing in your startup",
                        unread: false
                    }
                ];

                await Notification.insertMany(defaultSeeds);

                notifications = await Notification.find({ recipientId: userId })
                    .populate("senderId", "name avatarUrl")
                    .sort({ createdAt: -1 });
            }
        }

        const formatted = notifications.map(n => ({
            id: n._id.toString(),
            type: n.type,
            user: {
                name: n.senderId?.name || "Unknown User",
                avatar: n.senderId?.avatarUrl || ""
            },
            content: n.content,
            timestamp: n.createdAt.toISOString(),
            unread: n.unread
        }));

        return res.status(200).json({ success: true, notifications: formatted });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.id;
        await Notification.updateMany({ recipientId: userId, unread: true }, { $set: { unread: false } });
        return res.status(200).json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.id;
        await Notification.updateOne({ _id: id, recipientId: userId }, { $set: { unread: false } });
        return res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
