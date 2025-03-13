import React, { useState, createContext, useMemo, useRef } from 'react';

const VideoCallContext = createContext();

export default function VideoCallContextProvider({ children }) {

    const [localMic, setLocalMic] = useState(true);
    const [localVideo, setLocalVideo] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    const contextValue = useMemo(() => ({
        localMic,
        setLocalMic,
        localVideo, 
        setLocalVideo,
        localVideoRef,
        remoteVideoRef,
    }), [localMic, localVideo]);

    return (
        <VideoCallContext.Provider value={contextValue}>
            {children}
        </VideoCallContext.Provider>
    );
}

export { VideoCallContext };
