import mongoose from "mongoose";
import User from "./User.js";
import Connection from "./Connection.js";
import Group from "./Group.js";
import Chat from "./Chat.js";

const insertData = async (req, res) => {

    try {
        const currChat = await Chat.findById('67a1ee38a414b10ea74d481f');

        if (!currChat) {
            return res.json({ "Error": "Chat not found" });
        }

        currChat.poll[3].votes = [];

        const response = await currChat.save();

        return res.json({ response });
    } catch (error) {
        return res.json({ "Error": error.message || "Error occurred" });
    }
}

export default insertData;