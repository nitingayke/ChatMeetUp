import React, { useContext } from 'react';
import { CallEnd } from '@mui/icons-material';
import VideoCallContext from '../../context/VideoCallContext';
import { socket } from '../../services/socketService';
import UserContext from '../../context/UserContext';
import { useParams } from 'react-router-dom';

export default function RemoteUserRoom() {

    const { id } = useParams();
    const { remoteVideoRef } = useContext(VideoCallContext);
    const { loginUser } = useContext(UserContext);

    const handleCallEnd = () => {
        socket.emit('leave-call', { from: loginUser?._id, to: id });
    }

    return (
        <div className="border-gray-500 rounded-xl h-full w-full">

            <video
                ref={remoteVideoRef}
                className="w-full h-full rounded-xl"
                autoPlay
            ></video>



            <div className='sticky bottom-10 flex justify-center items-center'>
                <button
                    onClick={handleCallEnd}
                    className="w-18 h-10 flex justify-center items-center bg-red-600 hover:bg-red-500 text-white rounded-full shadow-md transition-all duration-200 cursor-pointer">
                    <CallEnd sx={{ fontSize: '1.4rem' }} />
                </button>
            </div>
        </div>
    )
}