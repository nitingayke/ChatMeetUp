import React, { useContext, useEffect } from "react";
import UserList from "../components/UserList";
import ChatRoom from "../components/ChatComponent/ChatRoom";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import UserContext from "../context/UserContext";
import ChatContext from "../context/ChatContext";
import LeftSidebar from "../components/SidebarLayout/LeftSidebar";
import Dialog from '@mui/material/Dialog';
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ChatPage() {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { loginUser } = useContext(UserContext);
    const { setSelectedUser, isDialogOpen, setIsDialogOpen } = useContext(ChatContext);


    useEffect(() => {
        if (!localStorage.getItem("authToken")) {
            enqueueSnackbar("You are not logged in. Please log in to continue.");
            navigate("/login");
        }
    }, [enqueueSnackbar, navigate]);

    useEffect(() => {
        return () => {
            setSelectedUser(null);
        }
    }, []);

    useEffect(() => {
        const handleBackButton = () => {
            if(isDialogOpen) {
                setIsDialogOpen(false);
            }
        }

        window.addEventListener('popstate', handleBackButton);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        }
    }, [isDialogOpen, setIsDialogOpen]);

    return (
        <>
            <LeftSidebar />
            <div className="flex-1 flex h-full">
                <div className="h-full flex-1 md:flex-none flex flex-col md:w-80 lg:w-90 md:border-e border-gray-700">
                    <UserList />
                </div>
                <div
                    className={`hidden md:flex h-full flex-1 flex-col bg-no-repeat bg-cover bg-gradient-to-bl from-purple-600 to-teal-400`}
                    style={loginUser?.backgroundImage && loginUser?.backgroundImage !== 'null' ? { backgroundImage: `url(${loginUser?.backgroundImage})` } : {}}
                >
                    <ChatRoom />
                </div>
            </div>

           <Dialog fullScreen open={isDialogOpen} TransitionComponent={Transition} className="block md:hidden" >
                <div
                    className={`text-white flex h-full flex-1 flex-col bg-no-repeat bg-cover bg-gradient-to-bl from-purple-600 to-teal-400`}
                    style={loginUser?.backgroundImage && loginUser?.backgroundImage !== 'null'
                        ? { backgroundImage: `url(${loginUser?.backgroundImage})` }
                        : {}}
                >
                    <ChatRoom />
                </div>
            </Dialog> 

        </>
    )
}