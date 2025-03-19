import httpStatus from 'http-status'
import User from '../models/User.js';

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
    const fileUrl = req.file?.url || req.file?.path;

    if (!fileUrl) {
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

    user.image = fileUrl;
    await user.save();

    return res.status(httpStatus.OK).json({
        success: true,
        message: 'Profile image updated successfully.',
        imageUrl: fileUrl,
    })
}

const getActiveUsers = async (req, res) => {
    const totalUsers = await User.countDocuments();
    return res.status(httpStatus.OK).json({ success: true, count: totalUsers });
}

export { updateUserData, updateUserProfileImage, getActiveUsers };