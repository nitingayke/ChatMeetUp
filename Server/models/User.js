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
    description: {
        type: String,
        maxlength: 400,
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