import React from 'react';
import { Routes, Route } from 'react-router-dom';
import StatusContextProvider from './context/StatusContextProvider';
import ChatPage from './pages/ChatPage';
import Login from './pages/userAuthentication/Login';
import Register from './pages/userAuthentication/Register';
import NotFound from './pages/NotFound';
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
import VideoCallContextProvider from './context/VideoCallContextProvider';
import HomePage from './pages/HomePage';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path='/' element={<HomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/u/chatting/:id?" element={<ChatPage />} />
            <Route path="/u/block-users" element={<BlockUserList />} />
            <Route path="/u/profile/:id" element={<UserProfile />} />
            <Route path="/u/join-requests" element={<JoinComponent />} />
            <Route path="/community/:id" element={<CommunityProfile />} />
            <Route path="/playground/wallpaper" element={<BackgroundWallpaper />} />
            <Route path="/live-users" element={<LiveUserList />} />

            <Route path="/video-call/:id" element={
                <VideoCallContextProvider>
                    <VideoCall />
                </VideoCallContextProvider>
            } />

            <Route
                path="/status/*"
                element={
                    <StatusContextProvider>
                        <Routes>
                            <Route path="/:statusType" element={<StatusList />} />
                            <Route path="/feed/:statusType" element={<StatusPage />} />
                            <Route path="/upload" element={<AddStatus />} />
                        </Routes>
                    </StatusContextProvider>
                }
            />

            <Route path="/new-group" element={<CreateGroup />} />
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
};

