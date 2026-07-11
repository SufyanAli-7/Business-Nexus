import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    guestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    date: {
        type: String, // format YYYY-MM-DD
        required: true
    },
    timeSlot: {
        type: String, // e.g. "10:00 AM - 11:00 AM"
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    }
}, {
    timestamps: true
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
