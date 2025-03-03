import React, { useMemo, useState } from "react";
import LoaderContext from "./LoaderContext";

export default function LoaderContextProvider({ children }) {

    const [isMessageProcessing, setIsMessageProcessing] = useState(false);

    const contextValue = useMemo(() => ({
        isMessageProcessing,
        setIsMessageProcessing,
    }), [isMessageProcessing]);

    return (
        <LoaderContext.Provider value={ contextValue } >
            {children}
        </LoaderContext.Provider>
    )
}