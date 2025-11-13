import React from 'react'
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

const Sidebar = () => {
    return (
        <div className="sidebar h-screen w-96 fixed left-0 top-0 bg-orange-700 border-r">
            <div className="flex gap-4">
                <Stack direction="row" spacing={4} color='orange'>

                    <IconButton aria-label="profile" color="white">
                        <AccountCircleIcon />
                    </IconButton>
                    <IconButton aria-label="messages" color="white">
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                    <IconButton aria-label="notification" color="white" >
                        <NotificationsNoneIcon />
                    </IconButton>
                    <IconButton aria-label="createpost" color="white" >
                        <AddCircleOutlineRoundedIcon />
                    </IconButton>

                </Stack>

               <Stack direction="row">

               </Stack>

                <Stack direction="column" spacing={4}>

                </Stack>


            </div>

            <div className="">

            </div>

            <div className="">

            </div>


        </div>
    )
}

export default Sidebar