import { useContext } from 'react';
import'./Main.css';
import { assets } from '../../assets/assets';
import { Context } from '../../context/context';


const Main = () => {
    const {onSent,response,setInput,input,} = useContext(Context);




    return (
        <div className='main'>
            <div className='nav'>
                <p>Gemini</p>
                <img src={assets.user_icon} alt='profile'/>
            </div>

            <div className="main_container">

                {!response
                ?<>
                <div className="greet">
                    <p> <span> Hello, Dev</span></p>
                    <p>How can I help you today?</p>
                </div>
                <div className="cards">
                    <div className="card">
                        <p> suggest a place in india for a road trip</p>
                        <img src ={assets.compass_icon} alt=''/>

                    </div>

                    <div className="card">
                        <p>breifly summerize  the concept of blockchain indexing</p>
                        <img src ={assets.bulb_icon} alt=''/>

                    </div>
                    <div className="card">
                        <p> give me some Ideas for doins an online event for my college club</p>
                        <img src ={assets.message_icon} alt=''/>

                    </div>
                    <div className="card">
                        <p>Fix this code and make it more efficient</p>
                        <img src ={assets.code_icon} alt=''/>

                    </div>
        
                </div>

                </>
                : <div className="result">

                </div>
             }
                


                
                <div className="main_bottom">
                    <div className="search_box">
                        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" placeholder="Enter promt here"/>
                        <div>
                            <img src={assets.gallery_icon} alt="" />
                            <img src={assets.mic_icon} alt="" />
                            <img onClick={()=> onSent()}  src={assets.send_icon} alt="" />
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