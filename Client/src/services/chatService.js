import axios from "axios";

const getChatData = async (chatId) => {

    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/chatRoute/user-chat', {
            chatId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const deleteChatMessage = async (chatId, userId) => {
    try {
        const response = await axios.patch('https://chatmeetupserver.onrender.com/chatRoute/delete-chat', {
            chatId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const changeBackgroundWallpaper = async (userId, url) => {
    try {
        const response = await axios.patch('https://chatmeetupserver.onrender.com/chatRoute/update-wallpaper', {
            userId,
            url
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const setBlockUser = async (blockId, userId) => {
    try {
        const response = await axios.patch('https://chatmeetupserver.onrender.com/chatRoute/block-entity', {
            blockId,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const cleanUserChats = async (chatId, userId) => {

    try {
        const response = await axios.patch('https://chatmeetupserver.onrender.com/chatRoute/clean-chats', {
            chatId,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const userExitGroup = async (groupId, userId) => {
    try {
        const response = await axios.delete(`https://chatmeetupserver.onrender.com/group/exit-group/${groupId}/${userId}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    } 
};

export {
    getChatData,
    deleteChatMessage,
    changeBackgroundWallpaper,
    setBlockUser,
    cleanUserChats,
    userExitGroup
};