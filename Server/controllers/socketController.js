import { Server } from "socket.io";
import Chat from "../models/Chat.js";

const onlineUsers = new Map(); // {userId, socketId}

const connectToSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST", "DELETE", "PUT"],
        },
    });

    console.log("Socket.IO is running...");

    io.on("connection", (socket) => {

        console.log(`A user connected: ${socket.id}`);

        socket.on('user-online', ({ userId }) => {

            onlineUsers.set(userId, socket.id);

            io.emit('update-online-users', Array.from(onlineUsers.keys()));
        });

        socket.on('userchat-poll-vote', async ({ conversationId, userId, username, chatId, pollIdx }) => {

            try {
                const currChat = await Chat.findById(chatId);

                if (!currChat) {
                    return socket.emit("error-notification", { message: "Chat not found" });
                }

                if (!currChat.poll[pollIdx]) {
                    return socket.emit("error-notification", { message: "Invalid poll option" });
                }

                const userAlreadyVoted = currChat.poll.some(option => option.votes.includes(userId));

                if (!userAlreadyVoted) {
                    currChat.poll[pollIdx].votes.push(userId);
                    await currChat.save();
                    io.emit("poll-vote-success", { conversationId, userId, username, chatId, pollIdx });
                } else {
                    socket.emit("error-notification", { message: "User has already voted." });
                }
            } catch (error) {
                return socket.emit("error-notification", { message: error.message || "Something went wrong." });
            }
        });

        socket.on("disconnect", () => {

            const userId = [...onlineUsers.entries()].find(([uId, socketId]) => socketId === socket.id)?.[0];

            if (userId) {
                onlineUsers.delete(userId);

                io.emit('update-online-users', Array.from(onlineUsers.keys()));
            }
            console.log("User disconnected.");
        });
    });
};

export { connectToSocket };
