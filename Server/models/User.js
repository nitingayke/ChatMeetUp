import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    mobileNo: {
        type: String,
        length: 10,
    },
    description: {
        type: String,
        maxlength: 200,
        default: 'Excited to be on ChatMeetUp! Looking forward to making new connections.'
    },
    backgroundImage: {
        type: String
    },
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection'
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    }],
    clearedChats: [
        {
            chatId: {
                type: mongoose.Schema.Types.ObjectId,
                required: true
            },
            clearedAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    blockUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
});

const User = mongoose.model('User', userSchema);
export default User;