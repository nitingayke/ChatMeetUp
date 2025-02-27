import Status from "../models/Status.js"

import httpStatus from 'http-status';

const getTotalUserStatus = async (req, res) => {

    const { statusType } = req.params;

    if (!statusType) {
        return res.status(httpStatus.BAD_REQUEST).json({
            message: "Status Type is required"
        });
    }

    const totalStatus = await Status.find({ statusType })
        .populate('user', 'username image');

    return res.status(httpStatus.OK).json({ success: true, totalStatus });
}

export {
    getTotalUserStatus
}
