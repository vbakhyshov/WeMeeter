import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import Messages from "../Messages/MessagesPage";
import CreatePostOverlay from "../CreatePost/CreatePostOverlay";
import NotificationsDrawer from '../../Components/Notifications/NotificationsDrawer';

const dummyNotifications = [
    { username: "ege_azgul", friendAvatar: "https://cdn.pixabay.com/photo/2025/08/09/17/47/modelling-9764984_1280.jpg", actionEvent: "made a post", when: "1m ago" },
    { username: "directed_by_daria", friendAvatar: "https://cdn.pixabay.com/photo/2025/09/22/17/45/vietnam-9849104_1280.jpg", actionEvent: "made a post", when: "3m ago" },
    { username: "mynameisyolop", friendAvatar: "https://cdn.pixabay.com/photo/2023/07/16/23/03/mask-8131581_1280.jpg", actionEvent: "viewed your profile", when: "10m ago" },
];

const Router = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [showCreatePost, setCreatePost] = useState(false);

    const location = useLocation();

    const openNotifications = () => setIsNotifOpen(true);
    const closeNotifications = () => setIsNotifOpen(false);

    useEffect(() => {
        setIsNotifOpen(false);
        if (location.pathname === '/messages') {
            setIsCollapsed(true);
            setIsNotifOpen(false);
        }
        if (location.pathname === '/') {
            setIsCollapsed(false);
            setIsNotifOpen(false);
        }
        if (location.pathname === '/me') {

        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div>
            {/* 1. Sidebar */}
            <div className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleSidebar={toggleSidebar}
                    onOpenCreatePost={() => setCreatePost(true)}
                    isNotifOpen={isNotifOpen}
                    onOpenNotifications={openNotifications}
                    onCloseNotifications={closeNotifications}
                />
            </div>

            {/* 2. Routes */}
            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-80'}`}>
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/me' element={<Profile />}></Route>
                    <Route path='/messages' element={<Messages />}></Route>
                </Routes>
            </div>

            {/* Create Post */}
            {showCreatePost && (
                <CreatePostOverlay onClose={() => setCreatePost(false)} />
            )}

            {/* NotificationsDrawer */}
            <NotificationsDrawer
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={dummyNotifications}
                isSidebarCollapsed={isCollapsed}
            />

        </div>
    )
}

export default Router;