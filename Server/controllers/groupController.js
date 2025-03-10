import httpStatus from 'http-status';
import bcrypt from 'bcryptjs';
import Group from '../models/Group.js';
import User from '../models/User.js'

const createNewGroup = async (req, res) => {

    const { name, description, password, userId } = req.body;
    const imageUrl = req.file ? req.file.path : "";

    const user = await User.findById(userId);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found!",
        });
    }

    let hashedPassword = null;
    if (password && password.trim().length > 0) {
        hashedPassword = await bcrypt.hash(password.trim(), 12);
    }

    const newGroup = new Group({
        name: name.trim(),
        description: description.trim(),
        password: hashedPassword,
        image: imageUrl,
        members: [{
            user: userId,
            role: 'admin'
        }]
    });

    await newGroup.save();

    user.groups.push(newGroup._id);
    await user.save();

    return res.status(httpStatus.CREATED).json({
        success: true,
        groupId: newGroup._id,
        message: "Group created successfully!"
    });
}

const updateGroupProfile = async (req, res) => {

    const { groupId, description } = req.body;
    const image = req.file?.path;

    if (!groupId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Group ID is required",
        });
    }

    const group = await Group.findById(groupId);
    if (!group) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Group not found",
        });
    }

    if (description) group.description = description;
    if (image) group.image = image;

    await group.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: "Group profile updated successfully",
    });
}

const userLeaveGroup = async (req, res) => {

    const { groupId, userId } = req.query;

    if (!groupId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Group ID and User ID are required",
        });
    }

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Group not found",
        });
    }

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found",
        });
    }

    const isMember = group.members.some(member => member.user.toString() === userId);
    if (!isMember) {
        return res.status(httpStatus.CONFLICT).json({
            success: false,
            message: "User is not a member of this group",
        });
    }

    group.members = group.members.filter(member => member.user.toString() !== userId);
    user.groups = user.groups.filter(group => group.toString() !== groupId);

    await group.save();
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: `User successfully left the group '${group.name}'`,
        userId,
    });
};

const userJoinGroup = async (req, res) => {

    const { groupId, userId, password } = req.body;

    if (!groupId || !userId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Group ID and User ID are required",
        });
    }

    const group = await Group.findById(groupId);
    const user = await User.findById(userId);

    if (!group) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Group not found",
        });
    }

    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "User not found",
        });
    }

    const isAlreadyMember = group.members.some(member => member.user.toString() === userId);
    if (isAlreadyMember) {
        return res.status(httpStatus.CONFLICT).json({
            success: false,
            message: "User is already a member of this group",
        });
    }

    if (group.password) {
        if (!password) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: "Password is required.",
            });
        }

        const isPasswordMatch = await bcrypt.compare(password, group.password);
        if (!isPasswordMatch) {
            return res.status(httpStatus.UNAUTHORIZED).json({
                success: false,
                message: "Wrong password",
            });
        }
    }


    group.members.push({ user: userId, role: 'member' });
    user.groups.push(groupId);

    const clearedChatIndex = user.clearedChats.findIndex(cc =>
        cc.chatId.toString() === groupId.toString()
    );

    if (clearedChatIndex !== -1) {
        user.clearedChats[clearedChatIndex].clearedAt = new Date();
    } else {
        user.clearedChats.push({ chatId: groupId, clearedAt: new Date() });
    }

    await group.save();
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: `User successfully joined the group '${group.name}'`,
        user: {
            role: 'member',
            user: {
                _id: user._id,
                username: user.username,
                image: user.image || '',
                description: user.description || '',
            },
        },
    });
};

const groupProfile = async (req, res) => {

    const { id } = req.body;

    if (!id) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Group ID is required",
        });
    }

    const group = await Group.findById(id)
        .populate({
            path: "members.user",
            select: "username image description"
        });

    if (!group) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Group not found",
        });
    }

    return res.status(httpStatus.OK).json({
        success: true,
        group
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
    createNewGroup,
    updateGroupProfile,
    userLeaveGroup,
    userJoinGroup,
    groupProfile,
    exitGroup
}