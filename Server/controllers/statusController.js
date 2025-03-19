import Status from "../models/Status.js"

import httpStatus from 'http-status';
import User from "../models/User.js";
import { response } from "express";

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

const deleteUserStatus = async (req, res) => {

    const { statusId } = req.params;

    if (!statusId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "Status ID is required.",
        });
    }

    const status = await Status.findById(statusId);
    if (!status) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Status not found.",
        });
    }

    await Status.findByIdAndDelete(statusId);

    return res.status(httpStatus.OK).json({
        success: true,
        statusId,
        message: "Status deleted successfully.",
    });
}

const getTotalStatusViews = async (req, res) => {

    const { statusId } = req.body;

    if (!statusId) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: 'Status id not found.',
        });
    }

    const status = await Status.findById(statusId)
        .populate("viewers", "username image description");

    if (!status) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: "Status not found.",
        });
    }

    return res.status(httpStatus.OK).json({
        success: true,
        viewers: status?.viewers,
    });
}

export {
    getTotalUserStatus,
    uploadNewStatus,
    deleteUserStatus,
    getTotalStatusViews
}
