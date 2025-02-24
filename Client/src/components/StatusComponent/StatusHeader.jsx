import React, { useContext } from "react";
import { Avatar, Tooltip } from "@mui/material";
import { Pause, PlayArrow, VolumeOff, VolumeUp } from '@mui/icons-material';
import { Link } from "react-router-dom";
import { formatTime } from "../../utils/helpers";
import StatusContext from "../../context/StatusContext";
import UserContext from "../../context/UserContext";

export default function StatusHeader() {

    const { isVideoPlaying, setIsVideoPlaying, isVideoMuted, setIsVideoMuted } = useContext(StatusContext);
    const { onlineUsers } = useContext(UserContext);

    const user = {
        _id: '454545454',
        username: "JohnDoe",
        avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmwla6vUQK67X5KHksARyVrL4Evo509hBcCA&s",
        statusTime: new Date(),
        isOnline: true,
    };

    return (
        <>
            <Link to={`/u/profile/${user?.username}`}>
                <Avatar src={user.avatar} alt={user.username} sx={{ width: 40, height: 40, marginRight: 1 }} />
            </Link>

            <div className="flex-1">
                <Link to={`/u/profile/${user?.username}`}>
                    <h2 className="line-clamp-1" style={{ fontWeight: "bold" }}>{user.username}</h2>
                </Link>
                <p className="text-[12px] text-gray-400 line-clamp-1">{formatTime(user.statusTime)}</p>
            </div>

            <button onClick={() => setIsVideoPlaying(!isVideoPlaying)} className=" me-2 text-gray-200">
                {isVideoPlaying ? <Pause /> : <PlayArrow />}
            </button>

            <button onClick={() => setIsVideoMuted(!isVideoMuted)} className="me-2 text-gray-200">
                {isVideoMuted ? <VolumeOff /> : <VolumeUp />}
            </button>


            {!onlineUsers?.includes(user?._id) && (
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
