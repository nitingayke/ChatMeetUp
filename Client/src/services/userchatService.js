import axios from "axios";

const blockUsersData = async (blockUsers, userId) => {
    try {
        const response = await axios.post("https://chatmeetupserver.onrender.com/chat-user/block-users", {
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
        const response = await axios.post("https://chatmeetupserver.onrender.com/chat-user/unblock-user", {
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
        const response = await axios.post("https://chatmeetupserver.onrender.com/chat-user/user-profile", {
            username
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch user profile, please try again." };
    }
}

const getGroupProfile = async (id) => {
    try {
        const response = await axios.post("https://chatmeetupserver.onrender.com/group/group-profile", {
            id
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch group profile, please try again." };
    }
}

const connectToUser = async (remoteId, userId) => {
    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/chat-user/create-connection', {
            remoteId,
            userId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to join user, please try again." };
    }
}

const joinGroup = async (groupId, userId, password) => {
    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/group/join-group', {
            groupId,
            userId,
            password
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to join group, please try again." };
    }
}

const leaveGroup = async (groupId, userId) => {
    try {
        const response = await axios.delete('https://chatmeetupserver.onrender.com/group/leave-group', {
            params: { groupId, userId }
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to leave group, please try again." };
    }
}

const getUsersData = async (usersId) => {
    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/chat-user/live-users-data', {
            usersId
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to get live users data." };
    }
}

const getTotalConnectionData = async (joinedUsers, joinedGroups) => {

    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/chat-user/total-Network', {
            joinedUsers,
            joinedGroups
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch network data." };
    }
}

export {
    blockUsersData,
    setUnblockUser,
    getUserProfile,
    getGroupProfile,
    connectToUser,
    joinGroup,
    leaveGroup,
    getUsersData,
    getTotalConnectionData
};