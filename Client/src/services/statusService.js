import axios from 'axios';

const getTotalStatus = async (statusType) => {
    try {
        const response = await axios.get(`http://localhost:8989/status/${statusType}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch user status." };
    }
}

export {
    getTotalStatus
}