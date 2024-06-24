
import  { useState } from 'react'
import './Sidebar.css'
import { assets } from "../../assets/assets";


function Sidebar() {
    const[extended, setExtended] = useState(false);




    return (
        <div className='sidebar'>
            <div className='top'>
                <img  onClick= {()=> setExtended(prev=>!prev)}className="menu" src={assets.menu_icon} alt='menu' />
                <div className='newchat'>
                    <img src={assets.plus_icon}  />
                    {extended?<p>New Chat</p>:null}
                </div>

                {extended? 
                <div className="recent">
                    <p className="recent_title"> Recent</p>
                    <div className="recent_entry">
                        <img src={assets.message_icon} alt="" />
                        <p> what is react...</p>
                    </div>
                </div> : null
                }
                
            </div>



            <div className='bottom'>
                <div className="bottom_item recent_entry">
                    <img src={assets.question_icon} alt=""  />
                    {extended?<p>Help</p>:null}
                </div>
                <div className="bottom_item recent_entry">
                    <img src={assets.history_icon} alt=""  />
                    {extended?<p>Activity</p>:null}
                </div>
                <div className="bottom_item recent_entry">
                    <img src={assets.setting_icon} alt="" />
                    {extended?<p>Settings</p>:null}
                </div>

            </div>
            
            

        


        </div>
        
    );
}
    
export default Sidebar
