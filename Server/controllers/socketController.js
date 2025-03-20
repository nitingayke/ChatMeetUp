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
const blockUsers = new Map();
const ongoingCalls = new Set();

const connectToSocket = (server) => {

    const io = new Server(server, {
        cors: {
            origin: "https://chatmeetup.vercel.app",
            methods: ["GET", "POST", "DELETE", "PUT"],
        },
    });

    console.log("Socket.IO is running...");

    io.on("connection", (socket) => {

        console.log(`A user connected: ${socket.id}`);

        socket.on('user-online', ({ userId }) => {

            if (!onlineUsers.has(userId)) {
                onlineUsers.set(userId, new Set());
            }

            onlineUsers.get(userId).add(socket.id);

            io.emit('update-online-users', Array.from(onlineUsers.keys()));
        });

        socket.on('chat-reaction', async ({ chatId, userId, emoji, recipientId, joinedUsers }) => {

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

                joinedUsers.forEach(joinUserId => {
                    if (onlineUsers.has(joinUserId)) {
                        onlineUsers.get(joinUserId).forEach(socketId => {
                            io.to(socketId).emit('chat-reaction-success', {
                                chatId,
                                userId,
                                emoji,
                                recipientId
                            });
                        });
                    }
                });

            } catch (error) {
                socket.emit("error-notification", { message: "Internal server error." });
            }
        });

        socket.on('userchat-poll-vote', async ({ conversationId, userId, username, chatId, pollIdx, joinedUsers }) => {

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

                    joinedUsers.forEach(joinUserId => {
                        if (onlineUsers.has(joinUserId)) {
                            onlineUsers.get(joinUserId).forEach(toUser => {
                                io.to(toUser).emit("poll-vote-success", { conversationId, userId, username, chatId, pollIdx });
                            });
                        }
                    });

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

                let joinUserIds = [];

                if (group) {
                    group.messages.push(newMessage._id);
                    await group.save();

                    joinUserIds = group.members.map(member => member.user.toString());

                } else if (connection) {
                    connection.messages.push(newMessage._id);
                    await connection.save();

                    joinUserIds = [connection.user1.toString(), connection.user2.toString()];

                } else {
                    return socket.emit("error-notification", { message: "Recipient not found." });
                }

                const populatedMessage = await Chat.findById(newMessage._id).populate({
                    path: 'sender',
                    select: 'username image description',
                });

                joinUserIds.forEach(userId => {
                    if (onlineUsers.has(userId)) {
                        onlineUsers.get(userId).forEach(socketId => {
                            io.to(socketId).emit('add-chat-message-success', {
                                recipientId,
                                data: populatedMessage,
                            });
                        });
                    }
                });

            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Something went wrong, Can't send message. Try again." });
            }
        });

        socket.on('mark-messages-read', async ({ chatId, userId, conversationId, joinedUsers }) => {
            try {
                const user = await User.findById(userId);

                await Chat.updateMany(
                    { _id: Array.isArray(chatId) ? { $in: chatId } : chatId, readBy: { $ne: userId } },
                    { $push: { readBy: userId } }
                );

                const userData = { _id: userId, username: user.username, image: user?.image }

                joinedUsers.forEach(joinUserId => {
                    if (onlineUsers.has(joinUserId)) {
                        onlineUsers.get(joinUserId).forEach(socketId => {
                            io.to(socketId).emit("mark-messages-read-success", { chatId, conversationId, userData });
                        });
                    }
                });

            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Unable to mark messages as read." });
            }
        });

        socket.on('delete-chat-message', async ({ chatId, conversationId, joinedUsers, userId }) => {
            try {
                if (!chatId || !conversationId) {
                    return socket.emit("error-notification", { message: "Invalid chat or conversation ID." });
                }

                const chatMessage = await Chat.findById(chatId);
                if (!chatMessage) {
                    return socket.emit("error-notification", { message: "Message not found." });
                }

                const connection = await Connection.findById(conversationId);
                const group = await Group.findById(conversationId);

                if (!connection && !group) {
                    return socket.emit("error-notification", { message: "Conversation not found." });
                }

                if (connection) {
                    connection.messages = connection.messages.filter(msgId => msgId.toString() !== chatId);
                    await connection.save();
                } else {
                    group.messages = group.messages.filter(msgId => msgId.toString() !== chatId);
                    await group.save();
                }

                await Chat.findByIdAndDelete(chatId);

                joinedUsers.forEach(joinUserId => {
                    if (onlineUsers?.has(joinUserId)) {
                        onlineUsers.get(joinUserId).forEach(socketId => {
                            io.to(socketId).emit("chat-message-deleted-success", { chatId, conversationId, userId });
                        });
                    }
                });

            } catch (error) {
                return socket.emit("error-notification", { message: "An error occurred while deleting the chat message." });
            }
        });

        socket.on('status-viewed', async ({ statusId, userId }) => {

            try {
                const updatedStatus = await Status.findByIdAndUpdate(
                    statusId,
                    { $addToSet: { viewers: userId } },
                    { new: true }
                );

                if (!updatedStatus) {
                    return socket.emit("error-notification", { message: error.message || "Status not found." });
                }

                socket.emit('status-view-updated', { statusId, viewers: updatedStatus.viewers });

            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Error updating status views." });
            }
        });

        socket.on('status-message', async ({ userId, remoteUserId, message, connectionId }) => {

            try {
                const newMessage = new Chat({
                    sender: userId,
                    message,
                    type: 'status'
                });

                await newMessage.save();

                await Connection.findByIdAndUpdate(connectionId, {
                    $push: { messages: newMessage._id }
                });

                const toRemoteUserSocketIds = onlineUsers.get(remoteUserId);

                if (toRemoteUserSocketIds) {
                    const populatedMessage = await Chat.findById(newMessage._id).populate({
                        path: 'sender',
                        select: 'username image description',
                    });

                    toRemoteUserSocketIds.forEach(socketId => {
                        io.to(socketId).emit('add-chat-message-success', {
                            recipientId: connectionId,
                            data: populatedMessage,
                        });
                    });
                }

                socket.emit("message-sent", { message: "Message sent successfully:" });

            } catch (error) {
                socket.emit("error-notification", { message: error.message || "Unable to send message." });
            }
        });

        socket.on('video-call-request', ({ to, username, userId }) => {

            if (blockUsers.get(to)?.has(userId)) {
                return socket.emit("error-notification", {
                    message: "You cannot call this user. They have blocked you."
                });
            }

            if (!onlineUsers.has(to)) {
                return socket.emit("error-notification", { message: "User is offline or unavailable for a call." });
            }

            if (!onlineUsers.has(userId)) {
                return socket.emit("error-notification", { message: "You are not online. Please reconnect and try again." });
            }

            if (onlineUsers.get(to).size > 1) {
                return socket.emit("error-notification", {
                    message: "User is currently active on multiple devices. Calls can only be made to a single active device."
                });
            }

            if (onlineUsers.get(userId).size > 1) {
                return socket.emit("error-notification", {
                    message: "You are active on multiple devices. Please use only one device to make a call."
                });
            }

            if (ongoingCalls.has(to) || ongoingCalls.has(userId)) {
                return socket.emit("error-notification", {
                    message: "users is already in another call."
                });
            }

            const userSocketId = onlineUsers.get(to)?.values().next().value;

            if (!userSocketId) {
                return socket.emit("error-notification", { message: "User is offline at the moment." });
            }

            io.to(userSocketId).emit('video-call-invitation', {
                from: userId,
                username
            });
        });

        socket.on('video-call-invitation-response', ({ from, to, action }) => {

            const userSocketId = onlineUsers.get(to)?.values().next().value;

            if (!userSocketId) {
                return socket.emit("error-notification", { message: "User is no longer available to receive your response." });
            }

            if (action === "block") {
                if (!blockUsers.has(from)) {
                    blockUsers.set(from, new Set());
                }
                blockUsers.get(from).add(to);
            } else if (action === 'allow') {
                ongoingCalls.add(from);
                ongoingCalls.add(to);
            }

            io.to(userSocketId).emit('video-call-invitation-remote-response', {
                action,
                from
            });
        });

        socket.on('offer', ({ offer, to }) => {
            try {
                if (!to) {
                    return socket.emit("error-notification", { message: "Invalid recipient for offer." });
                }

                const userSockets = onlineUsers?.get(to);

                if (!userSockets || userSockets.size === 0) {
                    return socket.emit("error-notification", { message: "User is offline at the moment." });
                }

                const userSocketId = userSockets.values().next().value;

                if (!userSocketId) {
                    return socket.emit("error-notification", { message: "No active connection found for the user." });
                }

                io.to(userSocketId).emit('offer', { offer, sender: socket.id });
            } catch (error) {
                socket.emit("error-notification", { message: "An error occurred while sending the offer." });
            }
        });

        socket.on('answer', ({ answer, to }) => {
            try {
                if (!to) {
                    return socket.emit("error-notification", { message: "Invalid recipient for answer." });
                }

                io.to(to).emit('answer', { answer, sender: socket.id });
            } catch (error) {
                socket.emit("error-notification", { message: "An error occurred while sending the answer." });
            }
        });

        socket.on('ice-candidate', ({ candidate, to }) => {
            try {
                if (!to) {
                    return socket.emit("error-notification", { message: "Invalid recipient for ICE candidate." });
                }

                const userSockets = onlineUsers?.get(to);

                if (!userSockets || userSockets.size === 0) {
                    return socket.emit("error-notification", { message: "User is offline at the moment." });
                }

                const userSocketId = userSockets.values().next().value;

                if (!userSocketId) {
                    return socket.emit("error-notification", { message: "No active connection found for the user." });
                }

                io.to(userSocketId).emit('ice-candidate', { candidate, sender: socket.id });
            } catch (error) {
                socket.emit("error-notification", { message: "An error occurred while sending the ICE candidate." });
            }
        });

        socket.on('leave-call', ({ from, to }) => {

            if (!ongoingCalls.has(from) && !ongoingCalls.has(to)) {
                return;
            }

            ongoingCalls.delete(from);
            ongoingCalls.delete(to);

            socket.emit('leave-call');

            const remoteUserSockets = onlineUsers.get(to);

            if (remoteUserSockets) {
                remoteUserSockets.forEach((userSocketId) => {
                    socket.to(userSocketId).emit('leave-call');
                });
            }
        });

        socket.on('clear-call-data', ({ userId }) => {

            if (ongoingCalls.has(userId)) {
                ongoingCalls.delete(userId);
            }

            if (blockUsers.has(userId)) {
                blockUsers.delete(userId);
            }

            socket.emit('clear-call-data-success');
        });

        socket.on("disconnect", () => {

            onlineUsers.forEach((socketSet, userId) => {
                socketSet.delete(socket.id);
                if (socketSet.size === 0) {
                    onlineUsers.delete(userId);
                }
            });

            io.emit('update-online-users', Array.from(onlineUsers.keys()));
        });
    });
};

export { connectToSocket };
