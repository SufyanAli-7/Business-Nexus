import { Server } from "socket.io";
import Message from "../models/message.model.js";

let io;

export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        socket.on("register", (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`Socket ${socket.id} joined room: ${userId}`);
            }
        });

        socket.on("send_message", async (data) => {
            const { senderId, receiverId, content } = data;
            try {
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

                // Broadcast to receiver and sender rooms
                io.to(receiverId).emit("receive_message", formatted);
                io.to(senderId).emit("receive_message", formatted);
            } catch (err) {
                console.error("Error saving socket message:", err);
            }
        });

        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
