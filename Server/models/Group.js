import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
    {
        name: { // group name
            type: String,
            required: true,
            trim: true,
        },
        image: { 
            type: String,
        },
        description: { // about image
            type: String,
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
