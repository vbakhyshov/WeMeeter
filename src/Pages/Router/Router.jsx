import React from "react"
import {Route, Routes} from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";

const Router = () => {
    return (
        <div>
            <div className="fixed top-0 left-0 h-screen w-[25%]">
                <Sidebar />
            </div>
            <div className="ml-[25%]">
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/me' element={<Profile />}></Route>
                </Routes>
            </div>
        </div>
    )
}

export default Router