import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LeftSidebar from './components/SidebarLayout/LeftSidebar';
import ChatContextProvider from './context/ChatContextProvider';
import ChatPage from './pages/ChatPage';
import Login from './pages/userAuthentication/Login';
import Register from './pages/userAuthentication/Register';
import NotFound from './pages/NotFound';
import { getLoginUser } from './services/authService';
import UserContext from './context/UserContext';
import { useSnackbar } from "notistack";
import { socket } from './services/socketService';

function App() {
    const location = useLocation();
    const { loginUser, setLoginUser, setOnlineUsers } = useContext(UserContext);
    const { enqueueSnackbar } = useSnackbar();

    const token = localStorage.getItem('authToken');


    useEffect(() => {
        const fetchLoginUser = async () => {
            if (!token) return;

            try {
                const response = await getLoginUser();
                if (response?.status === 200) {
                    setLoginUser(response.data.user);
                }
            } catch (error) {
                enqueueSnackbar('User not logged in.');
            }
        };

        fetchLoginUser();
    }, [token, setLoginUser, enqueueSnackbar]);


    useEffect(() => {
        if (loginUser) {
            socket.emit('user-online', { userId: loginUser._id });
        }
    }, [loginUser]);


    useEffect(() => {
        const handleUpdateOnlineUsers = (users) => {
            setOnlineUsers(users);
        };

        const handleErrorNotification = ({ message }) => {
            enqueueSnackbar(message, { variant: "error" });
        };

        socket.on("update-online-users", handleUpdateOnlineUsers);
        socket.on('error-notification', handleErrorNotification);
        return () => {
            socket.off("update-online-users", handleUpdateOnlineUsers);
            socket.off('error-notification', handleErrorNotification);
        };
    }, [setOnlineUsers]);



    if (['/login', '/register'].includes(location.pathname)) {
        return (
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
            </Routes>
        );
    }

    return (
        <div className='h-full flex'>
            <LeftSidebar />
            <ChatContextProvider>
                <Routes>
                    <Route path='/u/chatting' element={<ChatPage />} />
                    <Route path='/u/chatting/:id' element={<ChatPage />} />
                    <Route path='*' element={<NotFound />} />
                </Routes>
            </ChatContextProvider>
        </div>
    );
}

export default App;
