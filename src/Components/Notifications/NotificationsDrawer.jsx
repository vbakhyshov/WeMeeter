import React from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import NotificationItem from './NotificationItem';

const NotificationsDrawer = ({ isOpen, onClose, notifications = [], isSidebarCollapsed }) => {
    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/10 z-[30]"
                    onClick={onClose}
                ></div>
            )}

            <div
                className={`
                    fixed top-0 h-screen w-80 bg-white shadow-2xl 
                    z-[40]
                    transform transition-all duration-300 ease-in-out
                    
                    left-0 
                    ${isSidebarCollapsed ? 'ml-20' : 'ml-80'} 

                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">Notifications</h2>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </div>

                <div className="overflow-y-auto h-full pb-20">
                    {notifications?.map((notif, index) => (
                        <NotificationItem
                            key={index}
                            user={notif.username}
                            text={notif.actionEvent}
                            avatar={notif.friendAvatar}
                            time={notif.when}
                        />
                    ))}
                </div>
            </div>
        </>
    );
};

export default NotificationsDrawer;