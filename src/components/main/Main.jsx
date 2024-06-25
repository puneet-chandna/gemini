
import'./Main.css';
import { assets } from '../../assets/assets';
const Main = () => {
    return (
        <div className='main'>
            <div className='nav'>
                <p>Gemini</p>
                <img src={assets.user_icon} alt='profile'/>
            </div>

            <div className="main_container">
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
            </div>
        </div>
    );
};

export default Main;