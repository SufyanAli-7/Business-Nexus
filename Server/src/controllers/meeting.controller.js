import Meeting from "../models/meeting.model.js";
import User from "../models/user.model.js";

export const scheduleMeeting = async (req, res) => {
    try {
        const hostId = req.id;
        const { guestId, title, description, date, timeSlot } = req.body;

        if (!guestId || !title || !date || !timeSlot) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // Conflict detection: Prevent double booking for either host or guest in pending/accepted meetings
        const conflict = await Meeting.findOne({
            date,
            timeSlot,
            status: { $in: ['pending', 'accepted'] },
            $or: [
                { hostId: hostId },
                { guestId: hostId },
                { hostId: guestId },
                { guestId: guestId }
            ]
        });

        if (conflict) {
            return res.status(400).json({
                success: false,
                message: "Time slot conflict detected. One of the participants is already booked for this slot."
            });
        }

        const meeting = new Meeting({
            hostId,
            guestId,
            title,
            description: description || "",
            date,
            timeSlot,
            status: "pending"
        });

        await meeting.save();
        return res.status(201).json({ success: true, meeting });
    } catch (error) {
        console.error("Error scheduling meeting:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const getMeetings = async (req, res) => {
    try {
        const userId = req.id;

        // Fetch meetings where the current user is host or guest
        const meetings = await Meeting.find({
            $or: [{ hostId: userId }, { guestId: userId }]
        })
        .populate("hostId", "name email role avatar startupName")
        .populate("guestId", "name email role avatar startupName")
        .sort({ date: 1, timeSlot: 1 });

        return res.status(200).json({ success: true, meetings });
    } catch (error) {
        console.error("Error fetching meetings:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const updateMeetingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'accepted' or 'rejected'
        const userId = req.id;

        if (!['accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid status value" });
        }

        // Only the guest/recipient is allowed to accept/reject meeting invitations
        const meeting = await Meeting.findOne({ _id: id, guestId: userId });
        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting invitation not found or access denied" });
        }

        meeting.status = status;
        await meeting.save();

        return res.status(200).json({ success: true, meeting });
    } catch (error) {
        console.error("Error updating meeting status:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteMeeting = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.id;

        // Either participant can cancel/delete the meeting
        const meeting = await Meeting.findOneAndDelete({
            _id: id,
            $or: [{ hostId: userId }, { guestId: userId }]
        });

        if (!meeting) {
            return res.status(404).json({ success: false, message: "Meeting not found or access denied" });
        }

        return res.status(200).json({ success: true, message: "Meeting deleted successfully" });
    } catch (error) {
        console.error("Error cancelling meeting:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
