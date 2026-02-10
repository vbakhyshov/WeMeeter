import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import LoginPage from "../LogSign/LoginPage";
import SignupPage from "../LogSign/SignupPage";
import Profile from "../Profile/Profile";
import Messages from "../Messages/MessagesPage";
import CreatePostOverlay from "../CreatePost/CreatePostOverlay";
import NotificationsDrawer from '../../Components/Notifications/NotificationsDrawer';
import ProtectedRoute from "./ProtectedRoute";

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

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

    const openNotifications = () => setIsNotifOpen(true);
    const closeNotifications = () => setIsNotifOpen(false);

    useEffect(() => {
        setIsNotifOpen(false);

        if (location.pathname === '/messages') {
            setIsCollapsed(true);
        }
        if (location.pathname === '/') {
            setIsCollapsed(false);
        }
    }, [location.pathname]);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* 1. Sidebar */}
            {!isAuthPage && (
                <div className={`fixed top-0 left-0 h-screen transition-all duration-300 z-40 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                    <Sidebar
                        isCollapsed={isCollapsed}
                        toggleSidebar={toggleSidebar}
                        onOpenCreatePost={() => setCreatePost(true)}
                        isNotifOpen={isNotifOpen}
                        onOpenNotifications={openNotifications}
                        onCloseNotifications={closeNotifications}
                    />
                </div>
            )}

            <div className={`flex-1 transition-all duration-300 ${!isAuthPage ? (isCollapsed ? 'ml-20' : 'ml-80') : ''}`}>
                <Routes>
                    <Route path='/login' element={<LoginPage/>}/>
                    <Route path='/signup' element={<SignupPage/>}/>

                    <Route path='/' element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
                    <Route path='/me' element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                    <Route path='/messages' element={<ProtectedRoute><Messages/></ProtectedRoute>}/>
                </Routes>
            </div>

            {isNotifOpen && (
                <div className="z-50">
                    <NotificationsDrawer
                        isOpen={isNotifOpen}
                        onClose={closeNotifications}
                        notifications={dummyNotifications}
                        isSidebarCollapsed={isCollapsed}
                    />
                </div>
            )}

            {showCreatePost && (
                <CreatePostOverlay onClose={() => setCreatePost(false)} />
            )}
        </div>
    );
}

export default Router;