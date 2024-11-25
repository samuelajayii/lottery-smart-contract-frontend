import React, { createContext, useState, useContext } from "react";

// Create the context
const AccountContext = createContext();

// Create the provider component
export const AccountProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [isOwner, setIsOwner] = useState(false);

    return (
        <AccountContext.Provider value={{ account, setAccount, isOwner, setIsOwner }}>
            {children}
        </AccountContext.Provider>
    );
};

// Custom hook to use the account context
export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error("useAccount must be used within an AccountProvider");
    }
    return context;
};
