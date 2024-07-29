import { useContext } from 'react';
import './Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/Context';

const Main = () => {
    const { onSent, recentPrompt, response, loading, resultData, setInput, input } = useContext(Context);

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
                {!response ? (
                    <>
                        <div className="greet">
                            <p><span>Hello, Dev</span></p>
                            <p>How can I help you today?</p>
                        </div>
                        <div className="cards">
                            <div className="card">
                                <p>Suggest a place in India for a road trip</p>
                                <img src={assets.compass_icon} alt='' />
                            </div>
                            <div className="card">
                                <p>Briefly summarize the concept of blockchain indexing</p>
                                <img src={assets.bulb_icon} alt='' />
                            </div>
                            <div className="card">
                                <p>Give me some ideas for doing an online event for my college club</p>
                                <img src={assets.message_icon} alt='' />
                            </div>
                            <div className="card">
                                <p>Fix this code and make it more efficient</p>
                                <img src={assets.code_icon} alt='' />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="result">
                        <div className="result_title">
                            <img src={assets.user_icon} alt="" />
                            <p>{recentPrompt}</p>
                        </div>
                        <div className="result_data">
                            <img src={assets.gemini_icon} alt="" />
                            {loading ? (
                                <div className="loader">
                                    <hr />
                                    <hr />
                                    <hr />
                                </div>
                            ) : (
                                <p dangerouslySetInnerHTML={{ __html: resultData }}></p>
                            )}
                        </div>
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
                            {input? <img onClick={handleSend} src={assets.send_icon} alt="" /> : null}
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

