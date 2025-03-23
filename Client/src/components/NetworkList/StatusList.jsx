import React, { useContext, useEffect, useState, useCallback, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import { Link, useNavigate, useParams } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Fade from "@mui/material/Fade";

import LeftSidebar from "../SidebarLayout/LeftSidebar";
import { formatTime } from "../../utils/helpers";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import StatusContext from "../../context/StatusContext";
import UserContext from "../../context/UserContext";
import AuthOptions from "../AuthOptions";
import { deleteStatus, getStatusViews, getTotalStatus } from "../../services/statusService";
import { useSnackbar } from "notistack";
import { Delete } from "@mui/icons-material";
import Tooltip from '@mui/material/Tooltip';
import { Dialog, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography } from "@mui/material";

export default function StatusList() {

    const navigate = useNavigate();
    const { statusType } = useParams();
    const { enqueueSnackbar } = useSnackbar();

    const { loginUser } = useContext(UserContext);
    const { totalStatus, setTotalStatus, setSelectedStatus, setSelectedStatusIdx } = useContext(StatusContext);

    const [anchorEl, setAnchorEl] = React.useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState("Missed");
    const [localStatus, setLocalStatus] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusViewOpen, setStatusViewOpen] = useState(false);
    const [statusViewUsers, setStatusViewUsers] = useState([]);
    const [statusViewLoading, setStatusViewLoading] = useState(false);

    const open = Boolean(anchorEl);

    const handleTotalStatus = useCallback(async () => {
        try {
            setIsLoading(true);

            const response = await getTotalStatus(statusType);

            if (response.success) {
                setTotalStatus(response.totalStatus);
            } else {
                enqueueSnackbar(response.message || "Failed to fetch statuses", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("Something went wrong!", { variant: "error" });
        } finally {
            setIsLoading(false);
        }
    }, [statusType, setTotalStatus, enqueueSnackbar]);

    useEffect(() => {
        if (!loginUser) return;
        handleTotalStatus();

    }, [loginUser, statusType, handleTotalStatus]);

    useEffect(() => {
        if (selectedFilter === "Missed") {
            const filteredStatus = totalStatus.filter(status => !status?.viewers?.includes(loginUser?._id))
            setLocalStatus(filteredStatus);
            setSelectedStatus(filteredStatus);
        } else if (selectedFilter === 'Watched') {
            const filteredStatus = totalStatus.filter(status => status?.viewers?.includes(loginUser?._id))
            setLocalStatus(filteredStatus);
            setSelectedStatus(filteredStatus);
        } else if (selectedFilter === 'MyStatus') {
            const filteredStatus = totalStatus.filter(status => status?.user?._id === loginUser?._id);
            setLocalStatus(filteredStatus);
        }
    }, [totalStatus, selectedFilter, loginUser]);

    useEffect(() => {
        if (selectedFilter === "Upload") {
            navigate("/status/upload");
            setSelectedFilter("Missed");
        }
    }, [selectedFilter, navigate]);

    const filteredStatus = useMemo(() => {
        return localStatus?.filter(status =>
            status?.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
        ) || [];
    }, [localStatus, searchQuery]);

    const handleClose = (filter) => {
        if (filter) setSelectedFilter(filter);
        setAnchorEl(null);
    };

    const handleDeleteStatus = async (status) => {
        if (status?.user?._id !== loginUser?._id) {
            enqueueSnackbar("You are autherize to delete status.", { variant: 'error' });
            return;
        }

        try {
            setIsLoading(true);
            const response = await deleteStatus(status?._id);

            if (response?.success) {
                const filteredStatus = totalStatus?.filter(prevStatus => prevStatus?._id !== response.statusId);
                setTotalStatus(filteredStatus);
                enqueueSnackbar(response.message || "Status deleted successfully!", { variant: 'success' });
            } else {
                enqueueSnackbar(response.message || "Failed to delete status.", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "An error occurred.", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    }

    const handleStatusView = async (status) => {

        if (!status) {
            enqueueSnackbar("Status not found, please try again.", { variant: "error" });
            return;
        }

        setStatusViewOpen(true);
        try {
            setStatusViewLoading(true);
            const response = await getStatusViews(status?._id);

            if (response?.success) {
                setStatusViewUsers(response.viewers);
            } else {
                enqueueSnackbar(response?.message || "Failed to fetch status views.", { variant: "error" });
            }
        } catch (error) {
            enqueueSnackbar("An error occurred while fetching status views.", { variant: "error" });
        } finally {
            setStatusViewLoading(false);
        }
    }

    if (!statusType || !["private", "public"].includes(statusType)) {
        return (
            <div className="w-full h-full text-gray-300 flex justify-center items-center text-3xl bg-gradient-to-b from-black to-gray-800">
                <span className="text-red-500 pe-1">404</span> | Not Found
            </div>
        );
    }

    if (!loginUser) {
        return <AuthOptions />;
    }

    return (
        <>
            <div className="bg-gradient-to-r from-black to-gray-800 md:bg-none">
                <LeftSidebar />
            </div>

            <div className="h-full bg-gradient-to-r from-black to-gray-800 w-full flex flex-col items-center overflow-auto pb-20">
                <header
                    className="z-20 sticky top-0 left-0 p-4 w-full flex justify-center items-center h-fit space-x-2 
                                bg-gradient-to-r from-black to-gray-800">

                    <div className="text-center text-base/3">
                        <p className="text-[0.8rem] text-orange-500" style={{ letterSpacing: "0.2rem" }}>
                            {statusType}
                        </p>
                        <h1 className="text-lg" style={{ fontWeight: "600" }}>
                            STATUS
                        </h1>
                    </div>
                    <div className="w-full h-fit flex border border-gray-500 rounded md:w-[26rem] lg:w-[30rem]">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search Status"
                            className="flex-1 px-2 py-1 w-[inherit]"
                        />
                        <button className="px-2 py-1 bg-gray-800 rounded-e">
                            <SearchIcon />
                        </button>
                    </div>

                    <button
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        className="border px-3 py-1 text-md rounded border-gray-500 cursor-pointer flex flex-nowrap"
                    >
                        <span className="whitespace-nowrap">{selectedFilter}</span>
                        {open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </button>
                    <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={() => setAnchorEl(null)}
                        TransitionComponent={Fade}
                        sx={{ marginTop: "0.2rem" }}
                    >
                        <MenuItem onClick={() => handleClose("Watched")}>Watched</MenuItem>
                        <MenuItem onClick={() => handleClose("Missed")}>Missed</MenuItem>
                        <MenuItem onClick={() => handleClose("MyStatus")}>My Status</MenuItem>
                        <MenuItem onClick={() => handleClose("Upload")}>Upload</MenuItem>
                    </Menu>
                </header>

                {isLoading ? (
                    <div className="flex flex-1 w-full h-full justify-center items-center">
                        <CircularProgress sx={{ color: 'white' }} />
                    </div>
                ) : (
                    <div className="h-full md:w-[37.8rem] lg:w-[41.8rem] px-4 md:px-0 w-full">
                        {
                            ((filteredStatus || []).length == 0)
                                ? <div className="h-full flex justify-center items-center text-gray-500">
                                    <p className="w-full text-center">
                                        No <span className="text-white break-words">{searchQuery || "status"}</span> found.
                                    </p>                                </div>
                                : <ul className="space-y-2">
                                    {
                                        filteredStatus.map((status, idx) => (
                                            <li key={status._id} className="w-full">
                                                <Link onClick={() => {
                                                    setSelectedStatus(filteredStatus);
                                                    setSelectedStatusIdx(idx);
                                                }}
                                                    to={status?._id ? `/status/feed/${statusType}` : "#"}
                                                    className="relative w-full flex items-center p-3 rounded bg-[#47474745] hover:bg-[#47474775]"
                                                >
                                                    <Avatar
                                                        sx={{ width: 50, height: 50 }}
                                                        className={`me-4 ${!status?.viewers?.includes(loginUser?._id) && 'border-3 border-green-400'}`}
                                                        alt=""
                                                        src={status?.user?.image || "/default-avatar.png"}
                                                    />

                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center">
                                                            <h1 className={`text-xl line-clamp-1`} style={{ fontWeight: "600" }}>
                                                                {(status?.user?.username || "").substring(0, 15)}
                                                            </h1>
                                                            <p className="text-gray-500 text-[0.7rem]">{formatTime(status?.createdAt)}</p>
                                                        </div>
                                                        <p className="text-gray-300 text-sm line-clamp-1 break-all">{status?.message}</p>
                                                        <div className="text-xs text-gray-400 flex items-center space-x-1 mt-1">
                                                            <p>{(status?.viewers || []).length}</p>
                                                            <VisibilityOutlinedIcon sx={{ fontSize: "0.9rem" }} />

                                                            {
                                                                (status?.user?._id === loginUser?._id) && <button onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    event.preventDefault();
                                                                    handleStatusView(status);
                                                                }} className="text-blue-500 hover:text-blue-600 hover:underline cursor-pointer"
                                                                >Views</button>
                                                            }
                                                        </div>
                                                    </div>

                                                    {
                                                        (status?.user?._id === loginUser?._id) && <Tooltip title="Delete Status" >
                                                            <button
                                                                onClick={(event) => {
                                                                    event.stopPropagation();
                                                                    event.preventDefault();
                                                                    handleDeleteStatus(status);
                                                                }}
                                                                className="absolute z-50 bottom-1 right-1 w-6 h-6 rounded text-gray-500 hover:text-white hover:bg-gray-500 cursor-pointer"

                                                            >
                                                                <Delete sx={{ fontSize: '1rem' }} />
                                                            </button>
                                                        </Tooltip>
                                                    }
                                                </Link>
                                            </li>
                                        ))}
                                </ul>
                        }
                        <br /><br /><br /><br />
                    </div>
                )}
            </div >

            <Dialog
                open={statusViewOpen}
                onClose={() => setStatusViewOpen(false)}
            >
                <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
                    {
                        statusViewUsers.map((user) =>
                            <ListItem alignItems="flex-start" key={user?._id} >
                                <ListItemAvatar>
                                    <Avatar alt={user?.username} src={user?.image || "#"} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={user?.username}
                                    secondary={
                                        <Typography
                                            component="span"
                                            variant="body2"
                                            sx={{
                                                color: 'text.primary',
                                                display: "-webkit-box",
                                                WebkitBoxOrient: "vertical",
                                                WebkitLineClamp: 2,
                                                overflow: "hidden",
                                            }}
                                        >
                                            {user.description}
                                        </Typography>
                                    }
                                />
                            </ListItem>

                        )
                    }
                </List>
            </Dialog>
        </>
    );
}