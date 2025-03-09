import React, { useContext, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatContextProvider from './context/ChatContextProvider';
import StatusContextProvider from './context/StatusContextProvider';
import ChatPage from './pages/ChatPage';
import Login from './pages/userAuthentication/Login';
import Register from './pages/userAuthentication/Register';
import NotFound from './pages/NotFound';
import { getLoginUser } from './services/authService';
import UserContext from './context/UserContext';
import { useSnackbar } from "notistack";
import { socket } from './services/socketService';
import LoaderContext from './context/LoaderContext';
import BackgroundWallpaper from './components/BackgroundWallpaper';
import BlockUserList from './components/NetworkList/BlockUserList';
import UserProfile from './pages/networkProfile/UserProfile';
import CommunityProfile from './pages/networkProfile/CommunityProfile';
import LiveUserList from './components/NetworkList/LiveUserList';
import JoinComponent from './components/JoinComponent';
import StatusPage from './pages/StatusPage';
import StatusList from './components/NetworkList/StatusList';
import AddStatus from './pages/AddStatus';
import VideoCall from './pages/VideoCall';
import CreateGroup from './components/CreateGroup';

function App() {

    const { loginUser, setLoginUser, setOnlineUsers } = useContext(UserContext);
    const { setIsMessageProcessing } = useContext(LoaderContext);
    const { enqueueSnackbar } = useSnackbar();

    const token = localStorage.getItem('authToken');

    useEffect(() => {
        const fetchLoginUser = async () => {
            if (!token) return;

            try {
                const response = await getLoginUser();

                if (response.status === 200) {
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

    const handleUpdateOnlineUsers = (users) => {
        setOnlineUsers(users);
    };

    const handleErrorNotification = ({ message }) => {
        enqueueSnackbar(message, { variant: "error" });
        setIsMessageProcessing(false);
    };

    useEffect(() => {

        socket.on("update-online-users", handleUpdateOnlineUsers);
        socket.on('error-notification', handleErrorNotification);
        
        return () => {
            socket.off("update-online-users", handleUpdateOnlineUsers);
            socket.off('error-notification', handleErrorNotification);
        };
    }, [setOnlineUsers]);

    return (
        <div className='h-screen md:flex'>
            <ChatContextProvider>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/register' element={<Register />} />
                    <Route path='/u/chatting/:id?' element={<ChatPage />} />
                    <Route path='/u/block-users' element={<BlockUserList />} />
                    <Route path='/u/profile/:id' element={<UserProfile />} />
                    <Route path='/u/join-requests' element={<JoinComponent />} />
                    <Route path='/community/:id' element={<CommunityProfile />} />
                    <Route path='/playground/wallpaper' element={<BackgroundWallpaper />} />
                    <Route path='/live-users' element={<LiveUserList />} />

                    <Route path='/video-call/:id' element={<VideoCall />} />

                    <Route 
                        path='/status/*' 
                        element={
                            <StatusContextProvider>
                                <Routes>
                                    <Route path='/:statusType' element={<StatusList />} />
                                    <Route path='/feed/:statusType' element={<StatusPage />} />
                                    <Route path='/upload' element={<AddStatus />} />
                                </Routes>
                            </StatusContextProvider>
                        } 
                    />

                    <Route path='/new-group' element={<CreateGroup/>} />

                    <Route path='*' element={<NotFound />} />
                </Routes>
            </ChatContextProvider>
        </div>
    );
}

export default App;
