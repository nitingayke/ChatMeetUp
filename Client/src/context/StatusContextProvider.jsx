import React, { useState, useMemo } from "react";
import StatusContext from "./StatusContext";

export default function StatusContextProvider({ children }) {

    const [isVideoPlaying, setIsVideoPlaying] = useState(true);
    const [isVideoMuted, setIsVideoMuted] = useState(false);
    const [totalStatus, setTotalStatus] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState([]);
    const [selectedStatusIdx, setSelectedStatusIdx] = useState(0);
    const [currentPlayingStatus, setCurrentPlayingStatus] = useState(null);


    const contextValue = useMemo(() => ({
        isVideoPlaying,
        setIsVideoPlaying,
        isVideoMuted,
        setIsVideoMuted,
        totalStatus,
        setTotalStatus,
        selectedStatus, 
        setSelectedStatus,
        selectedStatusIdx, 
        setSelectedStatusIdx,
        currentPlayingStatus, 
        setCurrentPlayingStatus
    }), [isVideoPlaying, isVideoMuted, totalStatus, selectedStatus, selectedStatusIdx, currentPlayingStatus]);

    return (
        <StatusContext.Provider value={contextValue}>
            {children}
        </StatusContext.Provider>
    );
}
