import axios from 'axios';

const getTotalStatus = async (statusType) => {
    try {
        const response = await axios.get(`http://localhost:8989/status/${statusType}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch user status." };
    }
}

const uploadNewUserStatus = async (file, message, statusType, userId) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("message", message);
        formData.append("statusType", statusType);
        formData.append("userId", userId);

        const response = await axios.post("http://localhost:8989/status/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to upload status." };
    }
}


export {
    getTotalStatus,
    uploadNewUserStatus
}