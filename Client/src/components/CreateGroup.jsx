import React, { useContext, useState } from 'react';
import { Button, Backdrop, InputAdornment, IconButton, CircularProgress, Dialog } from '@mui/material';
import { Visibility, VisibilityOff, SentimentSatisfiedAlt } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import EmojiPicker from 'emoji-picker-react';
import { useNavigate } from 'react-router-dom';

import { createNewUserGroup } from '../services/groupService.js';
import UserContext from '../context/UserContext.js';
import AuthOptions from '../components/AuthOptions.jsx';

export default function CreateGroup() {

    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const { loginUser } = useContext(UserContext);

    const [isLoading, setIsLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [groupData, setGroupData] = useState({
        name: '',
        image: '',
        description: '',
        password: '',
        showPassword: false,
    });
    const [selectedImg, setSelectedImg] = useState(false);
    

    const handleChange = (e) => {
        const { name, value } = e.target;
        setGroupData({ ...groupData, [name]: value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setGroupData({ ...groupData, image: file });
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const togglePasswordVisibility = () => {
        setGroupData((prevState) => ({ ...prevState, showPassword: !prevState.showPassword }));
    };

    const handleEmojiClick = (emojiObject) => {
        setGroupData((prevState) => ({
            ...prevState,
            description: prevState.description + emojiObject.emoji
        }));
        setShowEmojiPicker(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!groupData.name.trim()) {
            enqueueSnackbar("Group name is required!", { variant: "error" });
            return;
        }

        if (groupData.password.trim().length < 8 || groupData.password.trim().length > 30) {
            enqueueSnackbar("Password must be between 8 and 30 characters!", { variant: "error" });
            return;
        }

        try {
            setIsLoading(true);
            const response = await createNewUserGroup(groupData, loginUser?._id);

            if (response.success) {
                enqueueSnackbar("Group created successfully!", { variant: "success" });
                navigate(`/u/chatting/${response.groupId}`);

                setGroupData((prev) => ({
                    ...prev,
                    name: '',
                    image: '',
                    description: '',
                    password: '',
                }));

            } else {
                enqueueSnackbar(response?.message || "Failed to create group", { variant: 'error' });
            }
        } catch (error) {
            enqueueSnackbar(error.message || "", { variant: 'error' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!loginUser) {
        return <AuthOptions />
    }

    return (
        <div className="w-full h-full bg-gradient-to-r from-black to-gray-800 flex justify-center overflow-auto relative">
            <form className="p-4 rounded-lg h-fit w-full max-w-md my-auto" onSubmit={handleSubmit}>
                <h2 className="text-white text-2xl text-center mb-4" style={{ fontWeight: '700' }}>Create New Group</h2>

                <label htmlFor="group-name" className="text-gray-300">Group Name <span className="text-red-500">*</span></label>
                <input
                    id="group-name"
                    type="text"
                    name="name"
                    value={groupData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-2 mb-4 rounded bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter group name"
                />

                <label htmlFor="group-image" className="text-gray-300">Upload Group Image</label>
                <input
                    id="group-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full p-2 mb-4 rounded bg-gray-800 text-gray-300 border border-gray-600"
                />
                {selectedImg && (
                    <img src={selectedImg} alt="Group Preview" className="my-2 rounded-md w-full h-32 object-cover" />
                )}

                <div className='mb-4'>
                    <label htmlFor="group-description" className="text-gray-300">Group Description</label>
                    <textarea
                        id="group-description"
                        name="description"
                        value={groupData.description}
                        onChange={handleChange}
                        rows="3"
                        className={`w-full p-2 rounded bg-gray-800 text-white border focus:ring-2 outline-none resize-none ${groupData.description.length > 200 ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-blue-500'}`}
                        placeholder="Enter a short description"
                    />

                    <button
                        type='button'
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className='border rounded p-1 text-gray-500 hover:text-orange-500 cursor-pointer'
                    >
                        <SentimentSatisfiedAlt />
                    </button>
                </div>

                <label htmlFor="group-password" className="text-gray-300 w-full">Group Password (Optional)</label>
                <div className="relative mb-4">
                    <input
                        id="group-password"
                        type={groupData.showPassword ? "text" : "password"}
                        name="password"
                        value={groupData.password}
                        onChange={handleChange}
                        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600 pr-10 focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Set a password (optional)"
                    />
                    <InputAdornment position="end" className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <IconButton onClick={togglePasswordVisibility}>
                            {groupData.showPassword ? <VisibilityOff style={{ color: '#ccc' }} /> : <Visibility style={{ color: '#ccc' }} />}
                        </IconButton>
                    </InputAdornment>
                </div>

                <Button type={isLoading ? 'button' : 'submit'} variant="contained" fullWidth sx={{ background: '#1976d2', '&:hover': { background: '#1565c0' } }}>
                    {isLoading ? <CircularProgress className='m-1' sx={{ color: 'white' }} size="20px" /> : 'Create Group'}
                </Button>
            </form>
            {showEmojiPicker && (
                <Dialog
                    open={showEmojiPicker}
                    onClose={() => setShowEmojiPicker(false)}
                    sx={{ color: "#fff", zIndex: 50, backdropFilter: "blur(5px)" }}
                >
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                </Dialog>
            )}
        </div>
    );
}
