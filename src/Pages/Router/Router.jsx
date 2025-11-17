import React from "react"
import {Route, Routes} from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";
import Profile from "../Profile/Profile";

const Router = () => {
    return (
        <div>
            <div>
                <Sidebar />
            </div>
            <div className="ml-[30%]">
                <Routes>
                    <Route path='/' element={<HomePage />}></Route>
                    <Route path='/me' element={<Profile />}></Route>
                </Routes>
            </div>
        </div>
    )
}

export default Router