import httpStatus from 'http-status';
import Group from '../models/Group.js';
import Connection from '../models/Connection.js';
import User from '../models/User.js';

const getBlockUsers = async (req, res) => {

    const { blockUsers, userId } = req.body;

    if (!blockUsers || !Array.isArray(blockUsers) || blockUsers.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Invalid request. blockUsers should be a non-empty array of user IDs.",
        });
    }

    const blockList1 = await Group.find(
        { _id: { $in: blockUsers } },
        "name image description"
    );

    const connections = await Connection.find({
        _id: { $in: blockUsers }
    })
        .populate("user1", "username image description")
        .populate("user2", "username image description");


    const blockList2 = connections.map(conn => {
        const selectedUser = conn.user1._id.toString() === userId ? conn.user2 : conn.user1;
        return {
            _id: conn._id,
            username: selectedUser.username,
            image: selectedUser.image
        };
    });

    return res.status(httpStatus.OK).json({
        success: true,
        users: [...blockList1, ...blockList2],
    });
}

const unblockUser = async (req, res) => {

    const { blockUserId, userId } = req.body;

    if (!blockUserId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Missing userId or blockUserId",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found",
        });
    }

    if (!user.blockUser.includes(blockUserId)) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "User is not blocked",
        });
    }

    user.blockUser = user.blockUser.filter(id => id.toString() !== blockUserId);
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        blockUserId,
        message: "User unblocked successfully",
    });

}

const userProfile = async (req, res) => {

    const { username } = req.body;

    const user = await User.findOne({ username })
        .populate({
            path: 'connections',
            populate: [
                { path: 'user1', select: 'username image description' },
                { path: 'user2', select: 'username image description' },
            ]
        })
        .populate({
            path: 'groups',
            select: 'name image description members'
        });


    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found",
        });
    }

    return res.status(httpStatus.OK).json({
        success: true,
        user
    });
}

const createNewConnection = async (req, res) => {

    const { remoteId, userId } = req.body;

    const user1 = await User.findById(remoteId);
    const user2 = await User.findById(userId);

    if (!user1 || !user2) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "One or both users not found",
        });
    }

    const existingConnection = await Connection.findOne({
        $or: [
            { user1: remoteId, user2: userId },
            { user1: userId, user2: remoteId },
        ],
    });

    if (existingConnection) {
        return res.status(httpStatus.CONFLICT).json({
            success: false,
            message: "Connection already exists",
            connectionId: existingConnection._id,
        });
    }

    const newConnection = new Connection({
        user1: remoteId,
        user2: userId,
    });

    const savedConnection = await newConnection.save();

    user1.connections.push(savedConnection._id);
    user2.connections.push(savedConnection._id);

    await user1.save();
    await user2.save();

    return res.status(httpStatus.CREATED).json({
        success: true,
        message: "Connection created successfully",
        connectionId: savedConnection._id,
    });
}

const getLiveUsersData = async (req, res) => {
    const { usersId } = req.body;

    if (!Array.isArray(usersId) || usersId.length === 0) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid or empty usersId array" });
    }

    const users = await User.find({ _id: { $in: usersId } }).select('username email image description');
    return res.status(httpStatus.OK).json({ success: true, users });

}

const getNetworkData = async (req, res) => {

    const { joinedUsers, joinedGroups } = req.body;

    const users = await User.find({ _id: { $nin: joinedUsers } }).select('username email image description');

    const groups = await Group.find({ _id: { $nin: joinedGroups } }).select('name image description members password');

    return res.status(httpStatus.OK).json({ success: true, users, groups });
}

export {
    getBlockUsers,
    unblockUser,
    userProfile,
    createNewConnection,
    getLiveUsersData,
    getNetworkData
};