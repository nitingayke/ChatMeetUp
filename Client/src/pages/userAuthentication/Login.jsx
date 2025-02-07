import React, { useState } from "react";
import { userLoginService } from "../../services/authService";
import { useSnackbar } from "notistack";
import CircularProgress from '@mui/material/CircularProgress';
import { Link, useNavigate } from 'react-router-dom';


export default function Login() {

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { username, password } = formData;

        try {
            setIsLoading(true);

            const response = await userLoginService(username, password);
            
            if (response.status === 200) {
                localStorage.setItem('authToken', response.data.token);
                enqueueSnackbar(response.data.message || 'User login succefully.', { variant: "success" });
                navigate("/");
            } else {
                enqueueSnackbar(response.data?.error || 'Network error, please try again.', { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar(error.message || 'An unexpected error occurred. Please try again.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-scrren text-white flex items-center justify-center min-h-screen bg-linear-to-r from-black to-gray-800">
            <div className="p-3 w-full max-w-md shadow-lg rounded-xl">

                <h2 className="text-4xl text-center" style={{ fontWeight: '800' }}>Login</h2>
                <form className="mt-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username or Email"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <button
                        type={ isLoading ? "button" : "submit" }
                        className={`flex justify-center items-center space-x-2 w-full px-4 py-2 mt-2 text-white rounded-lg transition duration-300 ${isLoading ? "bg-gray-800" : "bg-blue-500 hover:bg-blue-600"}`}
                    >
                        { isLoading && <CircularProgress size="25px" /> }
                        <span>Login</span>
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Don't have an account? <Link href="/register" className="text-blue-500">Register</Link>
                </p>
            </div>
        </div>
    );
}
