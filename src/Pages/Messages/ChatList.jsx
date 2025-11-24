import * as React from 'react';
import ListSubheader from '@mui/material/ListSubheader';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Collapse from '@mui/material/Collapse';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import DraftsIcon from '@mui/icons-material/Drafts';
import SendIcon from '@mui/icons-material/Send';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import StarBorder from '@mui/icons-material/StarBorder';
import {getSpaceUntilMaxLength} from "@testing-library/user-event/dist/utils";

const mDialog = [
    { friendNickname: "vlad_ys_lav", friendAvatar: "https://cdn.pixabay.com/photo/2022/02/17/20/37/dog-7019418_1280.jpg" },
    { friendNickname: "egeegeege", friendAvatar: "https://cdn.pixabay.com/photo/2025/08/09/17/47/modelling-9764984_1280.jpg" },
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
            <ListSubheader component="div" id="nested-list-subheader" sx={{ bgcolor: 'background.paper', zIndex: 1 }}>
                Messages
            </ListSubheader>

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