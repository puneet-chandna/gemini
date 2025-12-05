// src/context/Context.jsx
import { createContext, useState } from "react";
import PropTypes from "prop-types";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [chatSessions, setChatSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord);
        }, 75 * index);
    };

    const newChat = () => {

        if (chatHistory.length > 0) {
            const firstUserMessage = chatHistory.find(msg => msg.role === 'user');
            const newSession = {
                id: Date.now(),
                title: firstUserMessage?.content?.slice(0, 50) || "New Chat",
                messages: [...chatHistory],
                timestamp: new Date()
            };
            setChatSessions(prev => [newSession, ...prev]);
        }

        setLoading(false);
        setChatHistory([]);
        setResultData("");
    };

    const loadChatSession = (sessionId) => {
        const session = chatSessions.find(s => s.id === sessionId);
        if (session) {
            setChatHistory(session.messages);
            const lastAssistant = [...session.messages].reverse().find(msg => msg.role === 'assistant');
            setResultData(lastAssistant?.content || "");
        }
    };

    const onSent = async (promptText) => {
        if (!promptText) {
            console.error("Input cannot be empty or undefined");
            return;
        }

        const userMessage = { role: 'user', content: promptText };
        setChatHistory(prev => [...prev, userMessage]);

        setResultData("");
        setLoading(true);

        try {
            const response = await runChat(promptText);

            if (typeof response !== 'string') {
                throw new Error("Unexpected response format");
            }

            let newResponseArr = response.split(" ");
            for (let i = 0; i < newResponseArr.length; i++) {
                const nextWord = newResponseArr[i];
                delayPara(i, nextWord + " ");
            }

            setTimeout(() => {
                const assistantMessage = { role: 'assistant', content: response };
                setChatHistory(prev => [...prev, assistantMessage]);
            }, newResponseArr.length * 75);

        } catch (error) {
            console.error("Error fetching chat response: ", error);
            setResultData("Error: Could not fetch response");
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        chatHistory,
        chatSessions,
        onSent,
        loading,
        resultData,
        input,
        setInput,
        newChat,
        loadChatSession,
    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );
};

ContextProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

export default ContextProvider;

