import mongoose from "mongoose";
import User from "./User.js";
import Connection from "./Connection.js";
import Group from "./Group.js";
import Chat from "./Chat.js";

const insertData = async (req, res) => {

    try {
        
        const newMessage = new Chat({
            sender: '67a1e57093a029541e02920c',
            attachments: {
                pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            },
            message: "Google ask DSA question 2025.",
        });

        const responseChat = await newMessage.save();

        const createdGroup = await Group.findById('67a47dcc06c75febb9cccb45');

        createdGroup.messages.push(responseChat._id);
       
        const responseGroup = await createdGroup.save();

        return res.json({ responseGroup });
    } catch (error) {
        return res.json({ "Error": error.message || "Error occured"})
    }

}

export default insertData;