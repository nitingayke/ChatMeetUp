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

export {
    createNewGroup,
    updateGroupProfile
}