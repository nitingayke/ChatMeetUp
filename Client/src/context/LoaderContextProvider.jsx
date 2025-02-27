import React, { useMemo, useState } from "react";
import LoaderContext from "./LoaderContext";

export default function LoaderContextProvider({ children }) {

    const [isMessageProcessing, setIsMessageProcessing] = useState(false);
    const [selectedSidebarOpt, setSelectedSidebarOpt] = useState();

    const contextValue = useMemo(() => ({
        isMessageProcessing,
        setIsMessageProcessing,
        selectedSidebarOpt, 
        setSelectedSidebarOpt
    }), [isMessageProcessing, selectedSidebarOpt]);

    return (
        <LoaderContext.Provider value={ contextValue } >
            {children}
        </LoaderContext.Provider>
    )
}