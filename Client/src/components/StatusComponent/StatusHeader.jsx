import React, { useContext, useEffect, useState } from "react";
import { Avatar, Tooltip } from "@mui/material";
import { Pause, PlayArrow, VolumeOff, VolumeUp } from '@mui/icons-material';
import { Link } from "react-router-dom";
import { formatTime } from "../../utils/helpers";
import StatusContext from "../../context/StatusContext";
import UserContext from "../../context/UserContext";

export default function StatusHeader() {

    const { isVideoPlaying, setIsVideoPlaying, isVideoMuted, setIsVideoMuted, currentPlayingStatus } = useContext(StatusContext);
    const { onlineUsers } = useContext(UserContext);

    const [localSelectedStatus, setLocalSelectedStatus] = useState(null);

    useEffect(() => {
        
        if(!currentPlayingStatus) return;

        setLocalSelectedStatus(currentPlayingStatus);
    }, [currentPlayingStatus])

    return (
        <>
            <Link to={`/u/profile/${localSelectedStatus?.user?.username}`}>
                <Avatar src={localSelectedStatus?.user?.image} alt={localSelectedStatus?.user?.username} sx={{ width: 40, height: 40, marginRight: 1 }} />
            </Link>

            <div className="flex-1">
                <Link to={`/u/profile/${localSelectedStatus?.user?.username}`}>
                    <h2 className="line-clamp-1" style={{ fontWeight: "bold" }}>{localSelectedStatus?.user?.username}</h2>
                </Link>
                <p className="text-[12px] text-gray-400 line-clamp-1">{formatTime(localSelectedStatus?.createdAt)}</p>
            </div>

            <button onClick={() => setIsVideoPlaying(!isVideoPlaying)} className=" me-2 text-gray-200">
                {isVideoPlaying ? <Pause /> : <PlayArrow />}
            </button>

            <button onClick={() => setIsVideoMuted(!isVideoMuted)} className="me-2 text-gray-200">
                {isVideoMuted ? <VolumeOff /> : <VolumeUp />}
            </button>


            {onlineUsers?.includes(localSelectedStatus?.user?._id) && (
                <Tooltip title="User Online" arrow>
                    <span className="relative flex size-3">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00ff00] opacity-75"></span>
                        <span className="relative inline-flex size-3 rounded-full bg-[#00ff00]"></span>
                    </span>
                </Tooltip>
            )}
        </>
    );
}