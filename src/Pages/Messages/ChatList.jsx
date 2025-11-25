import * as React from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';

const mDialog = [
    { friendNickname: "vlad_ys_lav", friendAvatar: "https://cdn.pixabay.com/photo/2022/02/17/20/37/dog-7019418_1280.jpg" },
    { friendNickname: "ege_azgul", friendAvatar: "https://cdn.pixabay.com/photo/2025/08/09/17/47/modelling-9764984_1280.jpg" },
    { friendNickname: "gavebygod", friendAvatar: "https://cdn.pixabay.com/photo/2025/01/22/11/33/cute-9351912_1280.jpg"},
    { friendNickname: "dianakhaski", friendAvatar: "https://cdn.pixabay.com/photo/2025/10/23/17/29/autumn-9912491_1280.jpg"},
    { friendNickname: "directed_by_daria", friendAvatar: "https://cdn.pixabay.com/photo/2025/09/22/17/45/vietnam-9849104_1280.jpg"},
    { friendNickname: "savelka", friendAvatar: "https://cdn.pixabay.com/photo/2025/06/13/05/57/model-9657359_1280.jpg"},
    { friendNickname: "mr_gamarjoba", friendAvatar: "https://cdn.pixabay.com/photo/2023/09/29/07/57/fruit-8283261_1280.jpg"},
];

const ChatList = ({onSelectChat}) => {
    const [open, setOpen] = React.useState(true);

    const handleClick = () => {
        setOpen(!open);
    };

    return (
        <List
            sx={{
                width: '100%',
                maxWidth: 360,
                bgcolor: 'background.paper',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                padding: 0,
                overflow: 'hidden'
            }}
            component="nav"
            aria-labelledby="nested-list-subheader"
        >
            <div className="flex justify-center items-center pt-3 mb-6">
                <div className="relative">
                    <input
                        type="text"
                        placeholder="find a dialog"
                        className="w-full py-3 pl-5 pr-10 rounded-full text-gray-700 text-sm focus:outline-none bg-pink-50/90"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-500">

                    </div>
                </div>
            </div>

            <div style={{ flexGrow: 1 }}></div>

            <div style={{ overflowY: 'auto', maxHeight: '100%' }}>
                {mDialog.map((messageFriend, index) => (
                    <ListItemButton key={index}
                                    onClick={() => onSelectChat(messageFriend)}
                    >
                        <ListItemIcon>
                            <Avatar
                                src={messageFriend.friendAvatar}
                                alt={messageFriend.friendNickname}
                                sx={{ width: 48, height: 48 }}
                            />
                        </ListItemIcon>
                        <ListItemText primary={messageFriend.friendNickname} />
                    </ListItemButton>
                ))}
            </div>
        </List>
    )
}

export default ChatList;