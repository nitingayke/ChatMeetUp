import React from "react";
import UserList from "../components/UserList";
import ChatRoom from "../components/ChatComponent/ChatRoom";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

export default function ChatPage() {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();


    if (!localStorage.getItem('authToken')) {
        enqueueSnackbar("You are not logged in. Please log in to continue.");
        navigate("/login");
        return;
    }

    return (
        <div className="flex-1 flex">

            <div className="h-full flex-1 md:flex-none flex flex-col md:w-80 lg:w-90 md:border-e border-gray-700">
                <UserList />
            </div>
            <div className="hidden md:flex h-full flex-1 flex-col bg-[url(https://images.unsplash.com/photo-1444464666168-49d633b86797?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YmlyZHxlbnwwfHwwfHx8MA%3D%3D)] bg-no-repeat bg-cover">
                <ChatRoom />
            </div>
        </div>
    )
}