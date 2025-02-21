import axios from "axios";

const updateUserData = async(description, mobileNo) => {
    try {
        const response = await axios.patch('/user-update/update-profile', {
            description,
            mobileNo
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch network data." };
    }
}

export { updateUserData };