import axios from 'axios';

const userLoginService = async (username, password) => {
    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/user/login', {
            username,
            password
        });

        return response;
    } catch (error) {
        return {
            success: false,
            error: error?.response?.data?.message || error?.message || "Login failed. Please try again."
        };
    }
}

const userRegisterService = async (username, email, password) => {

    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/user/register', {
            username,
            email,
            password
        });

        return response;
    } catch (error) {
        return {
            success: false,
            error: error?.response?.data?.message || error?.message || "Registration failed. Please try again."
        };
    }
}

const getLoginUser = async () => {
    try {
        const response = await axios.post('https://chatmeetupserver.onrender.com/user/get-login-user', {
            token: localStorage.getItem('authToken')
        });

        return response;
    } catch (error) {
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'User not logged in.'
        };
    }
};


export { userLoginService, userRegisterService, getLoginUser };