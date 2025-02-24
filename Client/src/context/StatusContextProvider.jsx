import React, { useState, useMemo } from "react";
import StatusContext from "./StatusContext";

export default function StatusContextProvider({ children }) {
    
    const [isVideoPlaying, setIsVideoPlaying] = useState(false); 
    const [isVideoMuted, setIsVideoMuted] = useState(false); 


    const contextValue = useMemo(() => ({
        isVideoPlaying,
        setIsVideoPlaying,
        isVideoMuted, 
        setIsVideoMuted
    }), [isVideoPlaying, isVideoMuted]);

    return (
        <StatusContext.Provider value={contextValue}>
            {children}
        </StatusContext.Provider>
    );
}
