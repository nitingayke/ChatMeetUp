import httpStatus from 'http-status';
import mongoose from 'mongoose';
import Connection from '../models/Connection.js';
import Group from '../models/Group.js';
import Chat from '../models/Chat.js';
import User from '../models/User.js';


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

const updatedBackgroundImage = async (req, res) => {

    const { userId, url } = req.body;

    if (!userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "User ID and image URL are required.",
        });
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { backgroundImage: url },
        { new: true }
    );

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found.",
        });
    }

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Background image updated successfully.",
        imgUrl: user.backgroundImage,
    });
}

const setBlockUser = async (req, res) => {

    const { blockId, userId } = req.body;

    if (!blockId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Both blockId and userId are required."
        });
    }

    const user = await User.findById(userId);

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found.",
        });
    }

    if (!user.blockUser.includes(blockId)) {
        user.blockUser.push(blockId);
        await user.save();
    }

    return res.status(httpStatus.OK).json({
        success: true,
        blockId,
        message: "Successfully blocked.",
    });
}

const cleanUserChats = async (req, res) => {

    const { chatId, userId } = req.body;

    if (!chatId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Chat and User are required.",
        });
    }

    const isGroup = await Group.exists({ _id: chatId });
    const isConnection = await Connection.exists({ _id: chatId });

    if (!isGroup && !isConnection) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Chat not found",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found",
        });
    }

    const clearedChatIndex = user.clearedChats.findIndex(cc => cc.chatId === chatId);

    if (clearedChatIndex !== -1) {
        user.clearedChats[clearedChatIndex].clearedAt = new Date();
    } else {
        user.clearedChats.push({ chatId, clearedAt: new Date() });
    }
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Chat cleared successfully",
        chatId,
    });
}

const exitGroup = async (req, res) => {

    const { groupId, userId } = req.params;

    if (!groupId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "Group ID and User ID are required." });
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(httpStatus.NOT_FOUND).json({ success: false, message: "Group not found." });
    }

    const isMember = group.members.some(member => member.user.toString() === userId);
    if (!isMember) {
        return res.status(httpStatus.FORBIDDEN).json({ success: false, message: "You are not a member of this group." });
    }

    group.members = group.members.filter(member => member.user.toString() !== userId);
    await group.save();

    await User.findByIdAndUpdate(userId, { $pull: { groups: groupId } });
    
    if (group.members.length === 0) {
        await Group.findByIdAndDelete(groupId);
        return res.status(httpStatus.OK).json({ success: true, message: "Group deleted as no members remain." });
    }

    return res.status(httpStatus.OK).json({ success: true, message: "Successfully exited the group." });
}

export {
    getUserChat,
    deleteChatMessage,
    updatedBackgroundImage,
    setBlockUser,
    cleanUserChats,
    exitGroup
};