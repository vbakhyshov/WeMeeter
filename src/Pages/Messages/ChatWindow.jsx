import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from "@mui/icons-material/Search";
import AttachFileIcon from '@mui/icons-material/AttachFile';

const DUMMY_DATABASE = {
    "vlad_ys_lav": [
        { id: 1, msg: "Hi, gandon!", sender: "them" },
        { id: 2, msg: "Hi, dovboyob.", sender: "me" },
        { id: 3, msg: "let's play tennis at 8 pm", sender: "me" },
        { id: 4, msg: "yeeeeeees", sender: "them" },
        { id: 5, msg: "blablabla", sender: "them" },
        { id: 6, msg: "whatever", sender: "them" },
        { id: 7, msg: "whatever", sender: "them" },
    ],
    "ege_azgul": [
        { id: 1, msg: "where r u bro?", sender: "them" },
        { id: 2, msg: "i'm in lidl", sender: "me" },
        { id: 3, msg: "where am i bro?", sender: "them" }
    ],
    "gavebygod": [
        { id: 1, msg: "aaaaaaaaaaaaaaaa???????", sender: "them" }
    ],
    "dianakhaski": [
        { id: 1, msg: "mat'", sender: "them" }
    ],
    "directed_by_daria": [
        { id: 1, msg: "i'll call u in 5 seconds", sender: "me" }
    ],
    "savelka": [
        { id: 1, msg: "brbsbsb", sender: "them" }
    ],
    "mr_gamarjoba": [
        { id: 1, msg: "awjfajfajfjf", sender: "me" }
    ]
};

const ChatWindow = ({selectedChat}) => {

    const[newMessage, setNewMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (selectedChat) {
            const dialogMessages = DUMMY_DATABASE[selectedChat.friendNickname];

            if (dialogMessages) {
                setMessages(dialogMessages);
            } else {
                setNewMessage([]);
            }
        }
    }, [selectedChat]);

    const handleSend = () => {
        if (newMessage.trim() === "") return;

        const newMsgObject = { id: Date.now(), msg: newMessage, sender: "me" };
        setMessages([...messages, newMsgObject]);
        setNewMessage("");
    };

    if (!selectedChat) {
        return (
            <div className="flex items-center justify-center h-full bg-gray-50 text-gray-900">
                <p>Choose a dialog</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col justify-center h-full bg-gray-100">

            <div className="flex justify-between bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center p-4 ">
                    <Avatar
                        src={selectedChat.friendAvatar}
                        alt={selectedChat.friendNickname}
                        sx={{ width: 50, height: 50, marginRight: 2 }}
                    />
                    <h2 className="text-lg font-bold text-gray-800">
                        {selectedChat.friendNickname}
                    </h2>
                </div>

                <div className="flex justify-end h-full">
                    <IconButton className="flex items-end">
                        <MoreVertIcon />
                    </IconButton>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length > 0 ? (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                                    msg.sender === 'me'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none'
                                }`}
                            >
                                {msg.msg}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-10">Start the conversation!</div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
                <IconButton>
                    <AttachFileIcon />
                </IconButton>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Write a message..."
                    className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
                <IconButton onClick={handleSend} color="primary">
                    <SendIcon />
                </IconButton>
            </div>
        </div>

    )
}

export default ChatWindow;