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
        const response = await axios.put('http://localhost:8989/chatRoute/delete-chat', {
            chatId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

export { getChatData, deleteChatMessage };