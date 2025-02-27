import { Server } from "socket.io";
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import Chat from "../models/Chat.js";
import Group from "../models/Group.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Status from "../models/Status.js";

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const onlineUsers = new Map();

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

        socket.on('chat-reaction', async ({ chatId, userId, emoji, recipientId }) => {

            try {
                if (!chatId || !userId || !emoji) {
                    return socket.emit("error-notification", { message: "Chat ID, User ID, and Emoji are required." });
                }

                const currChat = await Chat.findById(chatId);

                if (!currChat) {
                    return socket.emit("error-notification", { message: "Chat message not found." });
                }

                currChat.reactions = currChat.reactions || [];

                const existingReactionIndex = currChat.reactions.findIndex(
                    (reaction) => reaction.user.toString() === userId
                );

                if (existingReactionIndex !== -1) {
                    currChat.reactions[existingReactionIndex].emoji = emoji;
                } else {
                    currChat.reactions.push({ user: userId, emoji });
                }

                await currChat.save();

                io.emit('chat-reaction-success', {
                    chatId,
                    userId,
                    emoji,
                    recipientId
                });
            } catch (error) {
                socket.emit("error-notification", { message: "Internal server error." });
            }
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

        socket.on('add-chat-message', async ({ message, pollOptions, video, pdf, image, userId, recipientId }) => {

            let uploadedFiles = { image: null, video: null, pdf: null };

            try {
                if (!message && !pollOptions?.length && !video && !pdf && !image) {
                    return socket.emit("error-notification", { message: "Message must contains text, poll, video, pdf or image." });
                }

                if (!userId || !recipientId) {
                    return socket.emit("error-notification", { message: "User ID and Recipient ID are required." });
                }

                const senderExists = await User.findById(userId);
                if (!senderExists) {
                    return socket.emit("error-notification", { message: "Sender not found." });
                }

                if (image) {
                    const uploadedImage = await cloudinary.uploader.upload(image, { folder: "ChatMeetUp_Message_Files" });
                    uploadedFiles.image = uploadedImage.secure_url;
                }

                if (video) {
                    const uploadedVideo = await cloudinary.uploader.upload(video, {
                        resource_type: "video",
                        folder: "ChatMeetUp_Message_Files"
                    });
                    uploadedFiles.video = uploadedVideo.secure_url;
                }

                if (pdf) {
                    const uploadedPdf = await cloudinary.uploader.upload(pdf, {
                        resource_type: "raw",
                        folder: "ChatMeetUp_Message_Files"
                    });
                    uploadedFiles.pdf = uploadedPdf.secure_url;
                }

                const newMessage = new Chat({
                    sender: userId,
                    attachments: uploadedFiles,
                    message,
                    poll: Array.isArray(pollOptions) ? pollOptions.map(option => ({ option })) : [],
                });

                await newMessage.save();

                const group = await Group.findById(recipientId);
                const connection = await Connection.findById(recipientId);

                if (group) {
                    group.messages.push(newMessage._id);
                    await group.save();
                } else if (connection) {
                    connection.messages.push(newMessage._id);
                    await connection.save();
                } else {
                    return socket.emit("error-notification", { message: "Recipient not found." });
                }

                const populatedMessage = await Chat.findById(newMessage._id).populate({
                    path: 'sender',
                    select: 'username image description',
                });

                io.emit('add-chat-message-success', {
                    recipientId,
                    data: populatedMessage,
                });
            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Something went wrong, Can't send message. Try again." });
            }
        });

        socket.on('mark-messages-read', async ({ chatId, userId, conversationId }) => {
            try {
                const user = await User.findById(userId);

                await Chat.updateMany(
                    { _id: Array.isArray(chatId) ? { $in: chatId } : chatId, readBy: { $ne: userId } },
                    { $push: { readBy: userId } }
                );

                const userData = { _id: userId, username: user.username, image: user?.image }
                io.emit("mark-messages-read-success", { chatId, conversationId, userData });
            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Unable to mark messages as read." });
            }
        });

        socket.on('status-viewed', async ({ statusId, userId }) => {

            try {
                const updatedStatus = await Status.findByIdAndUpdate(
                    statusId,
                    { $addToSet: { viewers: userId } },
                    { new: true }
                );

                if(!updatedStatus) {
                    return socket.emit("error-notification", { message: error.message || "Status not found." });
                }

                socket.emit('status-view-updated', { statusId, viewers: updatedStatus.viewers });

            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Error updating status views." });
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
