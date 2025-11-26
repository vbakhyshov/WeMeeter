import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import Messages from "../Messages/MessagesPage";
import CreatePostOverlay from "../CreatePost/CreatePostOverlay";

const Router = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const [showCreatePost, setCreatePost] = useState(false);

    const location = useLocation();

    useEffect(() => {
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
        <div>
            {showCreatePost && (
                <CreatePostOverlay onClose={() => setCreatePost(false)} />
            )}
            <div className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleSidebar={toggleSidebar}

                    onOpenCreatePost={() => setCreatePost(true)}
                />
            </div>

            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-80'}`}>
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/me' element={<Profile />}></Route>
                    <Route path='/messages' element={<Messages />}></Route>
                </Routes>
            </div>

            {showCreatePost && (
                <CreatePostOverlay onClose={() => setCreatePost(false)} />
            )}

        </div>
    )
}

export default Router;