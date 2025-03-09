import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        image: {
            type: String,
        },
        description: {
            type: String,
            maxlength: 300,
            trim: true
        },
        password: {
            type: String,
            minlength: 8,
            maxlength: 64,
        },
        members: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                role: {
                    type: String,
                    enum: ['admin', 'member'],
                    default: 'member',
                },
            },
        ],
        messages: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Chat',
            },
        ],
    },
    {
        timestamps: true,
    }
);

const Group = mongoose.model('Group', groupSchema);
export default Group;
