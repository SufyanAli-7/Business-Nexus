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

        // WebRTC Signaling handlers
        socket.on("call_user", (data) => {
            const { callerId, receiverId, offer } = data;
            io.to(receiverId).emit("incoming_call", { callerId, offer });
        });

        socket.on("answer_call", (data) => {
            const { callerId, receiverId, answer } = data;
            io.to(callerId).emit("call_accepted", { receiverId, answer });
        });

        socket.on("ice_candidate", (data) => {
            const { senderId, receiverId, candidate } = data;
            io.to(receiverId).emit("ice_candidate", { senderId, candidate });
        });

        socket.on("end_call", (data) => {
            const { senderId, receiverId } = data;
            io.to(receiverId).emit("call_ended", { senderId });
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
