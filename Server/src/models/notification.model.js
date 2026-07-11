import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    recipientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    type: {
        type: String,
        enum: ["message", "connection", "investment", "general"],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    unread: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
