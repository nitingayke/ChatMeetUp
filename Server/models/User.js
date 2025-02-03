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
    connections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Connection'
    }],
    groups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
    }],
    blockUser: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
});

const User = mongoose.model('User', userSchema);
export default User;