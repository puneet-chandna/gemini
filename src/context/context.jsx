import  { createContext, useState } from "react";
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



    const onSent = async (input) => {  
        setResultData("");
        setLoading(true);
        setResponse(true);

        const response = await runChat(input);
        setResultData(response);
        setLoading(false);
        setInput("");
        
        
    }
    

    
        
    
    const contextValue= {
        previousPrompts,
        setPreviousPrompts,
        onSent,
        setRecentPrompt,
        recentPrompt,
        response,
        loading,
        resultData,
        input,
        setInput

    };

    return (
        <Context.Provider value={contextValue}>
            {props.children}
        </Context.Provider>
    );


}
ContextProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export default ContextProvider;

