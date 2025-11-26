import React, {useState} from 'react'
import ChatList from "../Messages/ChatList";
import ChatWindow from "../Messages/ChatWindow";

const MessagesPage = () => {
    const [currentChat, setCurrentChat] = useState(null);

    return (
        <div className="flex h-screen w-full overflow-hidden">

            <div className="w-1/5 min-w-[300px] border-r">
                <ChatList onSelectChat={setCurrentChat} />
            </div>

            <div className="flex-1 bg-gray-100 h-full">
                <ChatWindow selectedChat={currentChat} />
            </div>

        </div>
    )
}

export default MessagesPage;