import React, { useState } from "react";
import LoaderContext from "./LoaderContext";

export default function LoaderContextProvider({ children }) {
    
    const [isMessageProcessing, setIsMessageProcessing] = useState(false);

    return (
        <LoaderContext.Provider value={{ isMessageProcessing, setIsMessageProcessing }} >
            { children }
        </LoaderContext.Provider>
    )
}