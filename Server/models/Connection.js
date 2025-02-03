import mongoose, { Schema } from "mongoose";

const connectionSchema = new Schema(
    {
        user1: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        user2: {
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        },
        messages: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Chat',
        }]
    }, { timestamps: true }
);

const Connection = mongoose.model('Connection', connectionSchema);
export default Connection;