import httpstatus from 'http-status';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import User from "../models/User.js";

const userLogin = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(httpstatus.BAD_REQUEST).json({
            success: false,
            message: "Username and password are required."
        });
    }

    const existUser = await User.findOne({
        $or: [
            { username: username },
            { email: username }
        ]
    })


    if (!existUser) {
        return res.status(httpstatus.NOT_FOUND).json({
            success: false,
            message: 'User not found!'
        })
    }

    const isPasswordMatch = await bcrypt.compare(password, existUser.password);

    if (!isPasswordMatch) {
        return res.status(httpstatus.UNAUTHORIZED).json({
            success: false,
            message: 'Wrong Password, Please Try Again',
        });
    }

    const token = jwt.sign({ username: username, id: existUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    return res.status(httpstatus.OK).json({
        success: true,
        token,
        message: 'User logged in successfully.'
    })
}


const userRegister = async (req, res) => {

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(httpstatus.BAD_REQUEST).json({
            success: false,
            message: 'username, email and password are required.'
        });
    }

    const userExist = await User.findOne({ $or: [{ username }, { email }] });

    if (userExist) {
        return res.status(httpstatus.BAD_REQUEST).json({
            success: false,
            message: 'User already exists.'
        });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
        username,
        email,
        password: hashedPassword,
    });

    await newUser.save();

    return res.status(httpstatus.OK).json({
        status: true,
        message: 'User registered successfully.'
    });
}

const getLoginUserData = async (req, res) => {

    const { token } = req.body;

    if (!token) {
        return res.status(httpstatus.UNAUTHORIZED).json({
            success: false,
            message: 'User not found.'
        });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const loginUser = await User.findOne({ username: decoded.username })
        .populate({
            path: 'connections',
            populate: [
                { path: 'user1', select: 'username image description' },
                { path: 'user2', select: 'username image description' },
                {
                    path: 'messages',
                    populate: [
                        { path: 'sender', select: 'username image description' },
                        { path: 'poll', select: 'votes' },
                        { path: 'reactions' },
                        { path: 'readBy', select: 'username image description' },
                        { path: 'deleteBy', select: 'username image description' }
                    ]
                }
            ]
        }).populate({
            path: 'groups',
            populate: [
                { path: 'members.user', select: 'username image description' },
                {
                    path: 'messages',
                    populate: [
                        { path: 'sender', select: 'username image description' },
                        { path: 'poll', select: 'votes' },
                        { path: 'reactions' },
                        { path: 'readBy', select: 'username image description' },
                        { path: 'deleteBy', select: 'username image description' }
                    ]
                }
            ]
        }).populate('blockUser', 'username image description');

    if (!loginUser) {
        return res.status(httpstatus.NOT_FOUND).json({
            success: false,
            message: "User not found."
        });
    }

    return res.status(httpstatus.OK).json({
        success: true,
        user: loginUser,
    });
}

export { userLogin, userRegister, getLoginUserData };