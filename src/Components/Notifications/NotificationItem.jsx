import React from 'react';
import Avatar from '@mui/material/Avatar';

const NotificationItem = ({ user, text, time, avatar }) => {
    return (
        <div className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors">
            <Avatar src={avatar} alt={user} sx={{ width: 40, height: 40 }} />
            <div className="ml-3">
                <p className="text-sm text-gray-800">
                    <span className="font-bold">{user}</span> {text}
                </p>

                {time && <p className="flex text-xs text-gray-400 mt-1">{time}</p>}
            </div>
        </div>
    );
};

export default NotificationItem;