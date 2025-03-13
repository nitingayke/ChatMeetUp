import React, { useContext, useEffect } from 'react';
import RemoteUserRoom from './RemoteUserRoom';
import LocalUserRoom from './LocalUserRoom';
import { VideoCallContext } from '../../context/VideoCallContextProvider';
import { useParams } from 'react-router-dom';

export default function VideoHome() {

    const { id } = useParams();
    const { localVideoRef, localMic, localVideo } = useContext(VideoCallContext);

    useEffect(() => {
        if (localVideoRef?.current) {
            navigator.mediaDevices.getUserMedia({ video: localVideo, audio: localMic })
                .then((stream) => {
                    localVideoRef.current.srcObject = stream;
                })
                .catch((err) => console.error('Error accessing media devices', err));
        }
    }, [id, localVideoRef]);

    return (
        <div className="h-screen w-screen bg-gradient-to-r from-black to-gray-800 flex justify-center items-center">
            <div className="p-4 h-full w-full relative">

                <RemoteUserRoom />

                <LocalUserRoom />

            </div>
        </div>
    );
}
