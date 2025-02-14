import axios from "axios";

const getChatData = async (chatId) => {

    try {
        const response = await axios.post('http://localhost:8989/chatRoute/user-chat', {
            chatId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const deleteChatMessage = async (chatId, userId) => {
    try {
        const response = await axios.patch('http://localhost:8989/chatRoute/delete-chat', {
            chatId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const changeBackgroundWallpaper = async(userId, url) => {
    try {
        const response = await axios.patch('http://localhost:8989/chatRoute/update-wallpaper', {
            userId,
            url
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const setBlockUser = async(blockId, userId) => {
    try {
        const response = await axios.patch('http://localhost:8989/chatRoute/block-entity', {
            blockId,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const cleanUserChats = async(chatId, userId) => {

    try {
        const response = await axios.patch('http://localhost:8989/chatRoute/clean-chats', {
            chatId,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

export { getChatData, deleteChatMessage, changeBackgroundWallpaper, setBlockUser, cleanUserChats };