import React, { useState, useMemo, useRef } from 'react';

import VideoCallContext from './VideoCallContext';

export default function VideoCallContextProvider({ children }) {

    const [localMic, setLocalMic] = useState(true);
    const [localVideo, setLocalVideo] = useState(true);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    }));


    const contextValue = useMemo(() => ({
        localMic,
        setLocalMic,
        localVideo,
        setLocalVideo,
        localVideoRef,
        remoteVideoRef,
        peerConnection
    }), [localMic, localVideo]);

    return (
        <VideoCallContext.Provider value={contextValue}>
            {children}
        </VideoCallContext.Provider>
    );
}

