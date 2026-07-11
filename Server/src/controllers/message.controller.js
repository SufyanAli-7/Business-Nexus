import Message from "../models/message.model.js";

export const getConversations = async (req, res) => {
    try {
        const userId = req.id;
        
        const messages = await Message.find({
            $or: [{ senderId: userId }, { receiverId: userId }]
        }).sort({ createdAt: -1 });

        const conversationsMap = {};
        
        messages.forEach(message => {
            const otherParticipantId = message.senderId.toString() === userId 
                ? message.receiverId.toString() 
                : message.senderId.toString();
            
            if (!conversationsMap[otherParticipantId]) {
                conversationsMap[otherParticipantId] = {
                    id: otherParticipantId,
                    participants: [userId, otherParticipantId],
                    lastMessage: {
                        id: message._id.toString(),
                        senderId: message.senderId.toString(),
                        receiverId: message.receiverId.toString(),
                        content: message.content,
                        timestamp: message.createdAt.toISOString(),
                        isRead: message.isRead
                    },
                    updatedAt: message.createdAt.toISOString()
                };
            }
        });

        const conversations = Object.values(conversationsMap);

        return res.status(200).json({ success: true, conversations });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const getMessagesBetweenUsers = async (req, res) => {
    try {
        const userId = req.id;
        const { otherUserId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: userId, receiverId: otherUserId },
                { senderId: otherUserId, receiverId: userId }
            ]
        }).sort({ createdAt: 1 });

        const formattedMessages = messages.map(m => ({
            id: m._id.toString(),
            senderId: m.senderId.toString(),
            receiverId: m.receiverId.toString(),
            content: m.content,
            timestamp: m.createdAt.toISOString(),
            isRead: m.isRead
        }));

        await Message.updateMany(
            { senderId: otherUserId, receiverId: userId, isRead: false },
            { $set: { isRead: true } }
        );

        return res.status(200).json({ success: true, messages: formattedMessages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

export const postMessage = async (req, res) => {
    try {
        const senderId = req.id;
        const { receiverId, content } = req.body;

        const message = new Message({
            senderId,
            receiverId,
            content
        });

        await message.save();

        const formatted = {
            id: message._id.toString(),
            senderId: message.senderId.toString(),
            receiverId: message.receiverId.toString(),
            content: message.content,
            timestamp: message.createdAt.toISOString(),
            isRead: message.isRead
        };

        if (req.io) {
            req.io.to(receiverId).emit('receive_message', formatted);
        }

        return res.status(201).json({ success: true, message: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
