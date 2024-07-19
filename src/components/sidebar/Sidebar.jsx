import { useContext, useState } from 'react';
import './Sidebar.css';
import { assets } from "../../assets/assets";
import { Context } from '../../context/Context';

function Sidebar() {
    const [extended, setExtended] = useState(false);
    const { previousPrompts, onSent } = useContext(Context);

    return (
        <div className='sidebar'>
            <div className='top'>
                <img onClick={() => setExtended(prev => !prev)} className="menu" src={assets.menu_icon} alt='menu' />
                <div className='newchat'>
                    <img src={assets.plus_icon} alt="plus" />
                    {extended ? <p>New Chat</p> : null}
                </div>

                {extended ? (
                    <div className="recent">
                        <p className="recent_title">Recent</p>
                        {previousPrompts.map((item, index) => (
                            <div key={index} className="recent_entry">
                                <img src={assets.message_icon} alt="" />
                                <p>{item}...</p>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>

            <div className='bottom'>
                <div className="bottom_item recent_entry">
                    <img src={assets.question_icon} alt="question" />
                    {extended ? <p>Help</p> : null}
                </div>
                <div className="bottom_item recent_entry">
                    <img src={assets.history_icon} alt="history" />
                    {extended ? <p>Activity</p> : null}
                </div>
                <div className="bottom_item recent_entry">
                    <img src={assets.setting_icon} alt="settings" />
                    {extended ? <p>Settings</p> : null}
                </div>
            </div>
        </div>
    );
}

export default Sidebar;

