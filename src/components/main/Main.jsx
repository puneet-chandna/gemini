import { useContext, useEffect, useRef } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';
import Markdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

const Main = () => {
    const { onSent, chatHistory, loading, resultData, setInput, input } = useContext(Context);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, resultData]);

    const handleSend = () => {
        if (input.trim() !== "") {
            onSent(input);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && input.trim() !== "") {
            handleSend();
        }
    };

    return (
        <div className='main'>
            <div className='nav'>
                <p>Gemini</p>
                <img src={assets.user_icon} alt='profile' />
            </div>

            <div className="main_container">
                {chatHistory.length === 0 && !loading ? (
                    <>
                        <div className="greet">
                            <p><span>Hello, Dev</span></p>
                            <p>How can I help you today?</p>
                        </div>
                        <div className="cards">
                            <div className="card" onClick={() => setInput("Suggest a place in India for a road trip")}>
                                <p>Suggest a place in India for a road trip</p>
                                <img src={assets.compass_icon} alt='' />
                            </div>
                            <div className="card" onClick={() => setInput("Briefly summarize the concept of blockchain indexing")}>
                                <p>Briefly summarize the concept of blockchain indexing</p>
                                <img src={assets.bulb_icon} alt='' />
                            </div>
                            <div className="card" onClick={() => setInput("Give me some ideas for doing an online event for my college club")}>
                                <p>Give me some ideas for doing an online event for my college club</p>
                                <img src={assets.message_icon} alt='' />
                            </div>
                            <div className="card" onClick={() => setInput("Fix this code and make it more efficient")}>
                                <p>Fix this code and make it more efficient</p>
                                <img src={assets.code_icon} alt='' />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="chat_container">
                        {chatHistory.map((message, index) => (
                            <div key={index} className={`message ${message.role}`}>
                                {message.role === 'user' ? (
                                    <div className="message_content">
                                        <img src={assets.user_icon} alt="user" className="message_icon" />
                                        <p>{message.content}</p>
                                    </div>
                                ) : (
                                    <div className="message_content">
                                        <img src={assets.gemini_icon} alt="gemini" className="message_icon" />
                                        <div className="assistant_message">
                                            <Markdown rehypePlugins={[rehypeHighlight]}>{message.content}</Markdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="message assistant">
                                <div className="message_content">
                                    <img src={assets.gemini_icon} alt="gemini" className="message_icon" />
                                    {resultData ? (
                                        <div className="assistant_message">
                                            <Markdown rehypePlugins={[rehypeHighlight]}>{resultData}</Markdown>
                                        </div>
                                    ) : (
                                        <div className="loader">
                                            <hr />
                                            <hr />
                                            <hr />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                )}

                <div className="main_bottom">
                    <div className="search_box">
                        <input
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            value={input}
                            type="text"
                            placeholder="Enter prompt here"
                        />
                        <div>
                            <img src={assets.gallery_icon} alt="" />
                            <img src={assets.mic_icon} alt="" />
                            {input ? <img onClick={handleSend} src={assets.send_icon} alt="" /> : null}
                        </div>
                    </div>
                    <p className="bottom_info">
                        Gemini may display inaccurate info, including about people, so double-check its responses. Your privacy & Gemini Apps
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Main;
