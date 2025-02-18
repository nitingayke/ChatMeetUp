import axios from "axios";

const blockUsersData = async (blockUsers, userId) => {
    try {
        const response = await axios.post("http://localhost:8989/chat-user/block-users", {
            blockUsers,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Something went wrong" };
    }
}

const setUnblockUser = async (blockUserId, userId) => {

    try {
        const response = await axios.post("http://localhost:8989/chat-user/unblock-user", {
            blockUserId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to unblock user, please try again." };
    }
}

const getUserProfile = async (username) => {
    try {
        const response = await axios.post("http://localhost:8989/chat-user/user-profile", {
            username
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch user profile, please try again." };
    }
}

const getGroupProfile = async (id) => {
    try {
        const response = await axios.post("http://localhost:8989/chat-user/group-profile", {
            id
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch group profile, please try again." };
    }
}

const connectToUser = async (remoteId, userId) => {
    try {
        const response = await axios.post('http://localhost:8989/chat-user/create-connection', {
            remoteId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to join user, please try again." };
    }
}

const joinGroup = async (groupId, userId) => {
    try {
        const response = await axios.post('http://localhost:8989/chat-user/join-group', {
            groupId,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to join group, please try again." };
    }
}

const leaveGroup = async (groupId, userId) => {
    try {
        const response = await axios.delete('http://localhost:8989/chat-user/leave-group', {
            params: { groupId, userId }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to leave group, please try again." };
    }
}

export { blockUsersData, setUnblockUser, getUserProfile, getGroupProfile, connectToUser, joinGroup, leaveGroup };