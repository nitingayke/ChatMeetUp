import httpStatus from 'http-status';
import Connection from '../models/Connection.js';
import Group from '../models/Group.js';
import mongoose from 'mongoose';
import Chat from '../models/Chat.js';


const getUserChat = async (req, res) => {

    const { chatId } = req.body;

    if (!chatId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Chat ID not found."
        });
    }

    if (!mongoose.isValidObjectId(chatId)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Invalid Chat ID format.",
        });
    }

    const [currChat, groupChat] = await Promise.all([
        Connection.findById(chatId)
            .populate([
                { path: 'user1', select: 'username image description' },
                { path: 'user2', select: 'username image description' },
                {
                    path: 'messages',
                    populate: [
                        { path: 'sender', select: 'username image description' },
                        { path: 'poll', select: 'votes' },
                        { path: 'reactions' },
                        { path: 'readBy', select: 'username image description' },
                    ]
                }
            ]),

        Group.findById(chatId)
            .populate([
                { path: 'members.user', select: 'username image description' },
                {
                    path: 'messages',
                    populate: [
                        { path: 'sender', select: 'username image description' },
                        { path: 'poll', select: 'votes' },
                        { path: 'reactions' },
                        { path: 'readBy', select: 'username image description' },
                    ]
                }
            ])
    ]);

    const chatData = currChat || groupChat;

    if (!chatData) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Chat data not found, please try again."
        });
    }

    return res.status(httpStatus.OK).json({
        success: true,
        userChat: chatData,
    });
}

const deleteChatMessage = async (req, res) => {

    const { chatId, userId } = req.body;

    if (!userId || !chatId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "User ID and Chat ID are required." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Invalid User ID format.",
        });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
        return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Chat message not found." });
    }

    if (!chat.deleteBy.includes(userId)) {
        chat.deleteBy.push(userId);
        await chat.save();
    }

    return res.status(httpStatus.OK).json({ success: true, message: "Message deleted for you." });
}

export { getUserChat, deleteChatMessage };