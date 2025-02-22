import httpStatus from 'http-status'
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import User from '../models/User.js';

dotenv.config();

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});

const updateUserData = async (req, res) => {
    const { description, mobileNo, userId } = req.body;

    const existingUser = await User.findById(userId);
    if (!existingUser) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found.',
        });
    }

    let updatedMobileNo = existingUser.mobileNo;
    if (mobileNo) {
        const trimmedMobileNo = mobileNo.trim();
        if (!/^\d+$/.test(trimmedMobileNo)) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Invalid mobile number. It should contain only digits.',
            });
        }
        if (trimmedMobileNo.length !== 10) {
            return res.status(httpStatus.BAD_REQUEST).json({
                success: false,
                message: 'Mobile number must be 10 digits long.',
            });
        }
        updatedMobileNo = trimmedMobileNo;
    }

    existingUser.description = (description.length > 0) ? description : existingUser.description;
    existingUser.mobileNo = updatedMobileNo;

    await existingUser.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Updated profile successfully.',
        description: existingUser.description,
        mobileNo: updatedMobileNo,
    });
}

const updateUserProfileImage = async (req, res) => {

    const { userId } = req.body;
    const file = req.file;

    if (!file) {
        return res.status(httpStatus.BAD_REQUEST).json({
            success: false,
            message: "No image file provided."
        });
    }

    const user = await User.findById(userId);
    if (!user) {
        return res.status(httpStatus.NOT_FOUND).json({
            success: false,
            message: 'User not found.',
        });
    }

    const uploadedImage = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'ChatMeetUp_Message_Files', transformation: [{ width: 500, height: 500, crop: "limit" }] },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(file.buffer);
    });

    user.image = uploadedImage.secure_url;
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Profile image updated successfully.',
        imageUrl: uploadedImage.secure_url,
    })
}

export { updateUserData, updateUserProfileImage };