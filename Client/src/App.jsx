import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LeftSidebar from './components/SidebarLayout/LeftSidebar';
import ChatContextProvider from './context/ChatContextProvider';
import ChatPage from './pages/ChatPage';
import UserContextProvider from './context/UserContextProvider';

function App() {


  return (
    <UserContextProvider>
      
      <div className='h-full flex'>
        <LeftSidebar />

        <ChatContextProvider>
          <Routes>
            <Route path='/u/chatting' element={<ChatPage />} />
          </Routes>
        </ChatContextProvider>
      </div>

    </UserContextProvider>
  )
}

export default App
