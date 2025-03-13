import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import UserContext from '../context/UserContext';
import VideoHome from '../components/VideoCallComponent/VideoHome';

export default function VideoCall() {
    const { id } = useParams();
    const { onlineUsers } = useContext(UserContext);

    if (!onlineUsers.includes(id)) {
        return (
            <div className="w-full h-full p-4 flex justify-center items-center bg-gradient-to-r from-black to-gray-800">
                <h1 className='p-3 text-xl rounded bg-black/50 text-white text-center shadow-md'>
                    User is offline and cannot be contacted for a video call.
                </h1>
            </div>
        );
    }

    return (
        <VideoHome />
    );
}
