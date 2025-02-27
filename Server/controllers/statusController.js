import Status from "../models/Status.js"

import httpStatus from 'http-status';
import User from "../models/User.js";

const getTotalUserStatus = async (req, res) => {

    const { statusType } = req.params;

    if (!statusType) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Status Type is required"
        });
    }

    const totalStatus = await Status.find({ statusType })
        .populate('user', 'username image')
        .sort({ createdAt: -1 });

    return res.status(httpStatus.OK).json({ success: true, totalStatus });
}

const uploadNewStatus = async (req, res) => {

    const { statusType, message, userId } = req.body;
    const fileUrl = req.file?.url || req.file?.path;

    if (!fileUrl) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "File upload failed"
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: "User not found." });
    }

    const newStatus = new Status({
        user: userId,
        statusType,
        Url: fileUrl,
        message,
    });

    await newStatus.save();
    return res.status(201).json({ success: true, message: "Status uploaded successfully" });
}

export {
    getTotalUserStatus,
    uploadNewStatus
}
