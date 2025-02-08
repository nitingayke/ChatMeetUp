import React, { useContext, useState } from 'react';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import List from '@mui/material/List';
import Skeleton from '@mui/material/Skeleton';
import ButtonGroup from '@mui/material/ButtonGroup';
import Button from '@mui/material/Button';
import UserContext from '../context/UserContext';

import ConnectionsList from './NetworkList/ConnectionsList';
import GroupList from './NetworkList/GroupList';

import { v4 as uuidv4 } from 'uuid';


export default function UserList() {

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedButton, setSelectedButton] = useState('users');

    const { loginUser } = useContext(UserContext);

    const componentContent = () => {
        let content = null;

        if (!loginUser) {
            content = Array(10).fill().map((_) => (
                <div key={uuidv4()} className="flex space-x-3 mb-4">
                    <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: '#595959e0' }} />
                    <div className='flex-1'>
                        <Skeleton variant="rectangular" width={'100%'} height={40} sx={{ bgcolor: '#595959e0', borderRadius: '3px' }} />
                        <Skeleton sx={{ bgcolor: '#595959e0' }} />
                    </div>
                </div>
            ));
        } else if (selectedButton === 'users') {
            content = <ConnectionsList searchQuery={searchQuery} />;
        } else {
            content = <GroupList searchQuery={searchQuery} />;
        }

        return <>{content}</>;
    };


    return (
        <>
            <div className='px-2 py-2 space-y-2 '>
                <div className="flex">
                    <input
                        type="text"
                        onChange={(e) => setSearchQuery(e.target.value)}
                        value={searchQuery}
                        className="w-full py-1 px-2 rounded-s bg-gray-800 text-gray-200"
                        placeholder="Search"
                    />
                    <button className="py-1 px-2 bg-gray-600 rounded-e text-gray-400 hover:text-white cursor-pointer">
                        <SearchRoundedIcon />
                    </button>
                </div>

                <ButtonGroup size="small" aria-label="Small button group" className='w-full text-blue-500' >
                    <Button
                        className={`w-1/2 text-sm border-s border-y rounded-s cursor-pointer`}
                        style={{ backgroundColor: selectedButton === 'users' ? '#006fff36' : '' }}
                        onClick={() => setSelectedButton('users')}
                    >USERS
                    </Button>
                    <Button
                        className={`w-1/2 text-sm border rounded-e cursor-pointer`}
                        style={{ backgroundColor: selectedButton === 'groups' ? '#006fff36' : '' }}
                        onClick={() => setSelectedButton('groups')}
                    >GROUPS
                    </Button>
                </ButtonGroup>

            </div>

            <div className="overflow-y-auto edit-scroll flex-1 px-2">
                <List className="space-y-2">
                    {
                        componentContent()
                    }
                </List>
            </div>
        </>
    );
}
