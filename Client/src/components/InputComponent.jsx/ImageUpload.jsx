import React, { useContext } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ChatContext from "../../context/ChatContext";
import { useSnackbar } from "notistack"

export default function ImageUpload() {

    const { setInputComponent, inputFile, setInputFile } = useContext(ChatContext);
    const { enqueueSnackbar } = useSnackbar();

    const handleFileChange = (event) => {
        const file = event.target.files[0];

        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                setInputFile(reader.result);
            }
        } else {
            enqueueSnackbar("Please select a valid image file.", { variant: "error" })
        }
    }

    const handleHideComponent = () => {
        setInputComponent(null);
        setInputFile(null);
    }

    return (
        <div className="text-sm w-full mb-3">
            <div className="flex justify-between items-center mb-2 space-x-3">
                <h1 style={{ fontWeight: "700" }}>Select Image</h1>
                <button onClick={handleHideComponent} className="h-7 w-7 rounded hover:bg-[#80808045] cursor-pointer">
                    <CloseIcon style={{ fontSize: "1.2rem" }} />
                </button>
            </div>

            <input type="file" accept="image/*" onChange={handleFileChange} className="border border-gray-500 w-full rounded px-2 py-1" />
            {
                inputFile && <img src={inputFile} alt="" height={200} className="my-2 h-20 rounded" />
            }

        </div>
    )
}