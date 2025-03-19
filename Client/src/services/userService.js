import axios from "axios";

const updateUserData = async (description, mobileNo, userId) => {
    try {
        const response = await axios.patch('http://localhost:8989/user-update/update-profile', {
            description,
            mobileNo,
            userId
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to fetch network data." };
    }
}

const updateUserProfileImage = async (imageFile, userId) => {
    try {

        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("userId", userId);

        const response = await axios.patch(
            'http://localhost:8989/user-update/update-profile-image',
            formData,
            {
                headers: { "Content-Type": "multipart/form-data" }
            }
        );

        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to update profile image." };
    }
};

const getTotalActiveUsers = async () => {
    try {
        const response = await axios.get('http://localhost:8989/user-update/get-active-users');
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: error.message || "Unable to get active users." };
    }
}

export { updateUserData, updateUserProfileImage, getTotalActiveUsers };