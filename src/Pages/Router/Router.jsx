import React from "react"
import {Route, Routes} from "react-router-dom";
import Sidebar from "../../Components/Sidebar/Sidebar";
import HomePage from "../HomePage/HomePage";

const Router = () => {
    return (
        <div>
            <div>
                <div className='flex'>
                    <Sidebar />
                </div>
                <div>
                    <Routes>
                        <Route path='/' element={<HomePage />}></Route>
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default Router