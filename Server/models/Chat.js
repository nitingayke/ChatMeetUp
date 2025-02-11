import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    attachments: {
        image: { type: String },
        pdf: { type: String },
        video: { type: String },
    },
    message: { type: String },
    poll: [
        {
            option: { type: String, required: true },
            votes: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
            ],
        },
    ],
    reactions: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // store emojis or some other to message
            emoji: { type: String, required: true },
        },
    ],
    readBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
    deleteBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ],
}, {
    timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
