import mongoose from "mongoose";
import User from "./User.js";
import Connection from "./Connection.js";
import Group from "./Group.js";
import Chat from "./Chat.js";
import Status from "./Status.js";

const tempSchema = [
    {
        user: '67a1df8193a029541e029208',
        statusType: 'public',
        Url: '/assets/temp.mp4',
        message: 'Our hard work today is the foundation for your success tomorrow. Stay consistent and trust the process.',
        viewers: ['67a454e784459b229e05f086', '67b72c2ddf8a3a754782ce3a']
    },
    {
        user: '67a1df8193a029541e029208',
        statusType: 'private',
        Url: 'https://media.istockphoto.com/id/1317323736/photo/a-view-up-into-the-trees-direction-sky.jpg?s=612x612&w=0&k=20&c=i4HYO7xhao7CkGy7Zc_8XSNX_iqG0vAwNsrH1ERmw2Q=',
        message: 'Never seen such a sunset.',
        viewers: []
    },
    {
        user: '67a454e784459b229e05f086',
        statusType: 'public',
        Url: 'https://i.ytimg.com/vi/3Q8u7nKKSiY/maxresdefault.jpg',
        message: 'At Nashik',
        viewers: []
    },
    {
        user: '67b72c2ddf8a3a754782ce3a',
        statusType: 'public',
        Url: 'https://t4.ftcdn.net/jpg/02/01/78/01/360_F_201780104_hetXS26W8alnsbDKbpnr4sVizJfiO12w.jpg',
        message: 'Everyone must visit this place once in life (^_^)',
        viewers: []
    },
    {
        user: '67b72c2ddf8a3a754782ce3a',
        statusType: 'public',
        Url: '/assets/temp2.mp4',
        message: "Don't know what I sent, but it's good. I'm just creating the UI.",
        viewers: []
    },
    {
        user: '67bd816f6231875874439036',
        statusType: 'public',
        Url: '/assets/temp3.mp4',
        message: 'Just testing the status feature.',
        viewers: []
    }
];


const insertData = async (req, res) => {

    try {
        const response = await Status.insertMany(tempSchema);
        return res.json(response);
    } catch (error) {
        return res.json({ "Error": error.message || "Error occurred" });
    }
}

export default insertData;