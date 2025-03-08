import axios from "axios"

const createNewUserGroup = async (groupData, userId) => {
    try {
        const formData = new FormData();
        formData.append("name", groupData.name);
        formData.append("description", groupData.description);
        formData.append("password", groupData.password);
        formData.append("userId", userId);

        if (groupData.image) {
            formData.append("image", groupData.image);
        }

        const response = await axios.post('http://localhost:8989/group/new-group', formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Something went wrong" };
    }
}

const changeGroupDetails = async (groupId, description, image) => {
    try {
        const formData = new FormData();
        formData.append("groupId", groupId);
        if (description) formData.append("description", description);
        if (image) formData.append("image", image);

        const response = await axios.patch("http://localhost:8989/group/update-group-profile", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data;
    } catch (error) {
        return { success: false, message: error.response?.data?.message || "Something went wrong" };
    }
}

export {
    createNewUserGroup,
    changeGroupDetails
}