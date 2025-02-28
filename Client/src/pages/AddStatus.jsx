import React, { useContext, useState } from 'react';
import { Select, MenuItem } from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import { useSnackbar } from 'notistack';
import EmojiPicker from 'emoji-picker-react';

import { uploadNewUserStatus } from '../services/statusService';
import UserContext from '../context/UserContext';
import AuthOptions from '../components/AuthOptions';
import LeftSidebar from '../components/SidebarLayout/LeftSidebar';

export default function AddStatus() {

  const { enqueueSnackbar } = useSnackbar();
  const { loginUser } = useContext(UserContext);

  const [statusType, setStatusType] = useState("public");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleEmojiClick = (emojiObject) => {
    setMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const checkFileSize = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.src = URL.createObjectURL(file);

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration > 60);
      };

      video.onerror = () => {
        resolve(false);
      };
    });
  };

  const handleStatusUpload = async () => {

    if (!loginUser) {
      enqueueSnackbar("User not logged in", { variant: 'error' });
      return;
    }

    if (!file) {
      enqueueSnackbar("Please select a file", { variant: 'error' });
      return;
    }

    if (file.type.startsWith("video/")) {
      const isTooLong = await checkFileSize(file);
      if (isTooLong) {
        enqueueSnackbar("Video duration should not exceed 60 seconds", { variant: "error" });
        setFile(null);
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await uploadNewUserStatus(file, message, statusType, loginUser._id);
      if (response.success) {
        enqueueSnackbar(response.message || "Status uploaded successfully", { variant: 'success' });
        setFile(null);
        setMessage("");
      } else {
        enqueueSnackbar(response.message || "Failed to upload status", { variant: "error" });
      }
    } catch (error) {
      enqueueSnackbar(error.message || "Failed to upload status", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!loginUser) {
    return <AuthOptions />
  }

  return (
    <>

      <div className='bg-gradient-to-r from-black to-gray-800 md:bg-none'>
        <LeftSidebar />
      </div>


      <div className='h-full flex-1 w-full p-4 bg-gradient-to-r from-black to-gray-800 flex items-center justify-center overflow-auto'>
        <div className='md:w-[40rem] h-fit rounded py-5 p-3 space-y-5 bg-[#36363691]  mb-10 lg:my-0'>
          <h1 className='text-center text-2xl md:text-3xl pb-2 text-white'>Upload Status</h1>

          <input
            type="file"
            accept='image/*, video/*'
            onChange={handleFileChange}
            className='border w-full p-1 rounded text-white'
          />

          <Select
            value={statusType}
            onChange={(e) => setStatusType(e.target.value)}
            fullWidth
            sx={{
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
            }}
            className="border border-white"
          >
            <MenuItem value="public">Public</MenuItem>
            <MenuItem value="private">Private</MenuItem>
          </Select>

          <div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter Message"
              className="border w-full rounded p-2 text-white bg-transparent focus:outline-none resize-none"
              rows={3}
            ></textarea>

            <button
              className='text-green-500 py-1 px-2 rounded bg-gray-800 cursor-pointer'
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <SentimentSatisfiedAltIcon sx={{ fontSize: '1.5rem' }} />
            </button>

            {showEmojiPicker && (
              <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 z-50 p-2">
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                  <button
                    className="mt-2 w-full py-1 bg-red-500 text-white rounded"
                    onClick={() => setShowEmojiPicker(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className='flex justify-center'>
            <button
              onClick={handleStatusUpload}
              className='px-5 py-2 rounded bg-blue-700 hover:bg-blue-600 transition duration-300 cursor-pointer text-white flex items-center justify-center'
            >
              {
                (isLoading) ? <CircularProgress size="20px" sx={{ color: 'white' }} /> : <span>Upload</span>
              }

            </button>
          </div>
        </div>
      </div>
    </>
  );
}
