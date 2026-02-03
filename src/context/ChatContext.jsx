import React, { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState(null); // { issueId, devId, name, issueTitle }
    const [hasNewMessage, setHasNewMessage] = useState(false);

    const openChat = (chatDetails) => {
        setActiveChat(chatDetails);
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
    };

    const toggleChat = () => {
        setIsOpen(!isOpen);
    };

    return (
        <ChatContext.Provider value={{ isOpen, activeChat, openChat, closeChat, toggleChat, hasNewMessage, setHasNewMessage }}>
            {children}
        </ChatContext.Provider>
    );
};
