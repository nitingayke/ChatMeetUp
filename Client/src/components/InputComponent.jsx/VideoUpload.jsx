import React, { useContext, useEffect } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ChatContext from "../../context/ChatContext";
import { useSnackbar } from "notistack";

export default function VideoUpload() {
    const { setInputComponent, inputFile, setInputFile } = useContext(ChatContext);
    const { enqueueSnackbar } = useSnackbar();

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("video/")) {
            enqueueSnackbar("Please select a valid video file.", { variant: "error" });
            return;
        }

        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = () => {
            window.URL.revokeObjectURL(video.src);
            if (video.duration > 300) {
                enqueueSnackbar("Video must not be longer than 5 minutes.", { variant: "error" });
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setInputFile(reader.result);
            };
        };

        video.src = URL.createObjectURL(file);
    };


    const handleHideComponent = () => {
        setInputComponent(null);
        setInputFile(null);
    };

    useEffect(() => {
        return () => {
            if (inputFile) {
                URL.revokeObjectURL(inputFile);
            }
        };
    }, [inputFile]);

    return (
        <div className="text-sm w-full mb-3">
            <div className="flex justify-between items-center mb-2 space-x-3">
                <h1 style={{ fontWeight: "700" }}>Select Video</h1>
                <button onClick={handleHideComponent} className="h-7 w-7 rounded hover:bg-[#80808045] cursor-pointer">
                    <CloseIcon style={{ fontSize: "1.2rem" }} />
                </button>
            </div>

            <input type="file" accept="video/*" onChange={handleFileChange} className="border border-gray-500 w-full rounded px-2 py-1" />

            {inputFile && (
                <video controls className="pt-2 h-30">
                    <source src={inputFile} type="video/mp4" />
                </video>
            )}
        </div>
    );
}
