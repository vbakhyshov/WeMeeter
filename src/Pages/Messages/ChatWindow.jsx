import React, {useEffect, useState} from 'react';
import Avatar from '@mui/material/Avatar';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';

const DUMMY_DATABASE = {
    "vlad_ys_lav": [
        { id: 1, text: "Hi, gandon!", sender: "them" },
        { id: 2, text: "Hi, dovboyob.", sender: "me" },
        { id: 3, text: "let's play tennis at 8 pm", sender: "me" },
        { id: 4, text: "yeeeeeees", sender: "them" },
        { id: 5, text: "blablabla", sender: "them" },
        { id: 6, text: "whatever", sender: "them" },
    ],
    "ege_azgul": [
        { id: 1, text: "where r u bro?", sender: "them" },
        { id: 2, text: "i'm in lidl", sender: "me" },
        { id: 3, text: "where am i bro?", sender: "them" }
    ],
    "gavebygod": [
        { id: 1, text: "aaaaaaaaaaaaaaaa???????", sender: "them" }
    ],
    "dianakhaski": [
        { id: 1, text: "mat'", sender: "them" }
    ],
    "directed_by_daria": [
        { id: 1, text: "i'll call u in 5 seconds", sender: "me" }
    ],
    "savelka": [
        { id: 1, text: "brbsbsb", sender: "them" }
    ],
    "mr_gamarjoba": [
        { id: 1, text: "awjfajfajfjf", sender: "me" }
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

        const newMsgObject = { id: Date.now(), text: newMessage, sender: "me" };
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

            <div className="flex items-center p-4 bg-white border-b border-gray-200 shadow-sm">
                <Avatar
                    src={selectedChat.friendAvatar}
                    alt={selectedChat.friendNickname}
                    sx={{ width: 50, height: 50, marginRight: 2 }}
                />
                <h2 className="text-lg font-bold text-gray-800">
                    {selectedChat.friendNickname}
                </h2>
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
                                {msg.text}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 mt-10">Start the conversation!</div>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-200 flex items-center gap-2">
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