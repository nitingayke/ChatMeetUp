import mongoose, { Schema } from "mongoose";

const statusSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        require: true
    },
    statusType: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    Url: {
        type: String,
        required: true
    },
    message: {
        type: String,
        trim: true
    },
    viewers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
}, {
    timestamps: true
});

const Status = mongoose.model('Status', statusSchema);
export default Status;