import React, { useContext, useState } from "react";
import CloseIcon from '@mui/icons-material/Close';
import ChatContext from "../../context/ChatContext";
import { useSnackbar } from "notistack"

const CreatePoll = () => {

    const [pollInput, setPollInput] = useState("");

    const { setInputComponent, pollOptions, setPollOptions } = useContext(ChatContext);
    const { enqueueSnackbar } = useSnackbar();

    const addOption = () => {
        if (!pollInput.trim()) return;

        if (pollOptions.length >= 7) {
            enqueueSnackbar("You exceeded the limit, you can add up to 7 options.", { variant: "error" });
            return;
        }

        setPollOptions((prev) => [...prev, pollInput]);
        setPollInput("");
    };

    const removeOption = (index) => {
        if (pollOptions.length > 0) {
            setPollOptions(pollOptions.filter((_, i) => i !== index));
        }
    };

    const handleHidePollComponent = () => {
        setInputComponent();
        setPollOptions([]);
    }

    return (
        <div className="text-sm w-full">

            <div className="flex justify-between items-center mb-2 space-x-3">
                <h1 style={{ fontWeight: "700" }}>Create Poll</h1>
                <button onClick={handleHidePollComponent} className="h-7 w-7 rounded hover:bg-[#80808045] cursor-pointer">
                    <CloseIcon style={{ fontSize: "1.2rem" }} />
                </button>
            </div>
            <div className="border border-gray-500 rounded flex">
                <input type="text"
                    className="flex-1 p-1 text-sm"
                    value={pollInput}
                    onChange={(e) => setPollInput(e.target.value)}
                    placeholder="Create Option" />
                <button onClick={addOption} className="bg-blue-500 hover:bg-blue-700 cursor-pointer rounded-e px-4">Add</button>
            </div>

            <div className="mt-3 flex flex-wrap space-x-1">
                {
                    pollOptions.map((opt, idx) => <div key={idx + "&" + opt} className="flex items-center border border-gray-700 w-fit rounded px-2 space-x-1 mb-2">
                        <p className="text-lg break-all">{opt}</p>
                        <button onClick={() => removeOption(idx)} className="hover:bg-red-500 w-5 h-5 flex rounded cursor-pointer">
                            <CloseIcon style={{ fontSize: "1.2rem" }} />
                        </button>
                    </div>)
                }
            </div>
        </div>
    );
};

export default CreatePoll;
