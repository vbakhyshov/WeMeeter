import React, { useState } from "react";
import { Route, Routes } from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";
import Messages from "../Messages/MessagesPage";

const Router = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleSidebar = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div>
            <div className={`fixed top-0 left-0 h-screen transition-all duration-300 ease-in-out z-50 ${isCollapsed ? 'w-20' : 'w-80'}`}>
                <Sidebar
                    isCollapsed={isCollapsed}
                    toggleSidebar={toggleSidebar}
                />
            </div>

            <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-80'}`}>
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/me' element={<Profile />}></Route>
                    <Route path='/messages' element={<Messages />}></Route>
                </Routes>
            </div>
        </div>
    )
}

export default Router;