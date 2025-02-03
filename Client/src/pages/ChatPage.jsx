import React, { useContext, useEffect } from "react";
import UserList from "../components/UserList";
import ChatRoom from "../components/ChatRoom";
import UserContext from "../context/UserContext";
import loginUser from '../TempData.js';

export default function ChatPage() {

    const { setLoginUser } = useContext(UserContext);

    useEffect(() => {
        setLoginUser(loginUser);
    }, [loginUser]);

    return (
        <div className="flex-1 flex"> {/* flex-wrap */}
            
            <div className="h-full flex-1 md:flex-none flex flex-col md:w-80 lg:w-90 md:border-e border-gray-700">
                <UserList/>
            </div>
            <div className="hidden md:flex h-full flex-1 flex-col bg-[url(https://thumbs.dreamstime.com/b/planet-earth-space-night-some-elements-image-furnished-nasa-52734504.jpg)] bg-no-repeat bg-cover">
                <ChatRoom />
            </div>
        </div>
    )
}