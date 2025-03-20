import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { userRegisterService } from "../../services/authService";
import { useSnackbar } from "notistack";
import CircularProgress from '@mui/material/CircularProgress';
import { Visibility, VisibilityOff } from "@mui/icons-material";

export default function Register() {
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: ""
    });
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility

    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { email, username, password } = formData;

        if (username.length > 30) {
            enqueueSnackbar("Username cannot exceed 30 characters.", { variant: "warning" });
            return;
        }
        
        
        try {
            setIsLoading(true);
            const usernameWithoutSpaces = username.replace(/\s/g, "");

            const response = await userRegisterService(usernameWithoutSpaces, email, password);

            if (response.status === 200) {
                enqueueSnackbar(response.data.message || 'User registered successfully.', { variant: "success" });
                setFormData({ email: "", username: "", password: "" });
                navigate('/login');
            } else {
                enqueueSnackbar(response?.error || 'Network error, please try again.', { variant: "error" });
            }

        } catch (error) {
            enqueueSnackbar(error.message || 'An unexpected error occurred. Please try again.', { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="text-white h-screen w-full flex items-center justify-center min-h-screen bg-gradient-to-r from-black to-gray-800">
            <div className="m-5 w-full max-w-md shadow-lg rounded-xl">
                <h2 className="text-3xl font-bold text-center">Register</h2>
                <form className="mt-6" onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                        />
                    </div>
                    <div className="mb-4 relative">
                        <input
                            type={showPassword ? "text" : "password"} // Toggle input type
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10"
                        />
                        {/* Toggle Password Visibility */}
                        <button
                            type="button"
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                        </button>
                    </div>
                    <button
                        type={isLoading ? "button" : "submit"}
                        className={`flex justify-center items-center space-x-2 w-full px-4 py-2 mt-2 text-white rounded-lg transition duration-300 ${isLoading ? "bg-gray-800" : "bg-blue-500 hover:bg-blue-600"}`}
                    >
                        {isLoading && <CircularProgress size="25px" />}
                        <span>Register</span>
                    </button>
                </form>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-blue-500">Login</Link> / <Link to={'/'} className="text-blue-500">Home</Link>
                </p>
            </div>
        </div>
    );
}
