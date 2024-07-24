// src/context/Context.jsx
import { createContext, useState } from "react";
import PropTypes from "prop-types";
import runChat from "../config/gemini";

export const Context = createContext();

const ContextProvider = (props) => {
    const [input, setInput] = useState("");
    const [recentPrompt, setRecentPrompt] = useState("");
    const [previousPrompts, setPreviousPrompts] = useState([]);
    const [response, setResponse] = useState(false);
    const [loading, setLoading] = useState(false);
    const [resultData, setResultData] = useState("");

    const delayPara = (index, nextWord) => {
        setTimeout(() => {
            setResultData(prev => prev + nextWord);
        }, 75 * index);
    };

    const onSent = async (input) => {
        setResultData("");
        setLoading(true);
        setResponse(true);
        setRecentPrompt(input);

        try {
            const response = await runChat(input);
            console.log("Chat response: ", response);
        
            if (typeof response !== 'string') {
                throw new Error("Unexpected response format");
            }

            let responseArr = response.split("**");
            let newResponse = "";
            for (let i = 0; i < responseArr.length; i++) {
                if (i === 0 || i % 2 !== 1) {
                    newResponse += responseArr[i];
                } else {
                    newResponse += "<b>" + responseArr[i] + "</b>";
                }
            }
            let newResponse2 = newResponse.split("*").join("</br>");
            let newResponseArr = newResponse2.split(" ");
            for (let i = 0; i < newResponseArr.length; i++) {
                const nextWord = newResponseArr[i];
                delayPara(i, nextWord + " ");
            }
            setPreviousPrompts(prev => [...prev, input]);
        } catch (error) {
            console.error("Error fetching chat response: ", error);
        } finally {
            setLoading(false);
            setInput("");
        }
    };

    const contextValue = {
        previousPrompts,
        setPreviousPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        response,
        loading,
        resultData,
        input,
        setInput,
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
