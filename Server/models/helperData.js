import mongoose from "mongoose";
import User from "./User.js";
import Connection from "./Connection.js";
import Group from "./Group.js";
import Chat from "./Chat.js";

const insertData = async (req, res) => {

    try {
        const user = await User.findOne({ username: 'patilgaurav' });

        if (!user) {
            return res.json({ "Error": "User not found" });
        }

        user.image = "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Convex_lens_%28magnifying_glass%29_and_upside-down_image.jpg/341px-Convex_lens_%28magnifying_glass%29_and_upside-down_image.jpg";

        const response = await user.save();

        return res.json({ response });
    } catch (error) {
        return res.json({ "Error": error.message || "Error occurred" });
    }
}

export default insertData;