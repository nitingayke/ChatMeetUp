import { Button } from "@mui/material";

import { Link } from "react-router-dom";

export default function AuthOptions() {

    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-black to-gray-800 text-white">
            <div className="text-center p-2">
                <h1 className="text-4xl font-bold mb-6">Welcome To
                    <span className="ps-2 text-orange-500" style={{ fontWeight: '800' }}>ChatMeetUp</span>
                </h1>
                <p className="text-lg mb-4">Please login or register to continue</p>
                <div className="space-x-4 space-y-4 flex flex-wrap justify-center">
                    <Link to={'/login'}>
                        <Button variant="contained" color="primary">Login</Button>
                    </Link>
                    <Link to={'/register'}>
                        <Button variant="contained" color="secondary">Register</Button>
                    </Link>
                    <Link to={'/chat-meet-up/about'} className="block">
                        <Button variant="outlined" color="inherit">View About</Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
