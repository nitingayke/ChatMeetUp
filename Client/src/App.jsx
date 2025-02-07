import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LeftSidebar from './components/SidebarLayout/LeftSidebar';
import ChatContextProvider from './context/ChatContextProvider';
import ChatPage from './pages/ChatPage';
import Login from './pages/userAuthentication/Login';
import Register from './pages/userAuthentication/Register';
import NotFound from './pages/NotFound';
import { getLoginUser } from './services/authService';
import UserContext from './context/UserContext';
import { useSnackbar } from "notistack";

function App() {

  const location = useLocation();

  const { setLoginUser } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();

  const token = localStorage.getItem('authToken');

  const handleLoginUserData = async () => {

    if (!token) {
      return;
    }

    try {
      const response = await getLoginUser();
      if (response?.status === 200) {
        setLoginUser(response.data.user);
      }
    } catch (error) {
      enqueueSnackbar('User not logged in.');
    }
  }

  useEffect(() => {
    handleLoginUserData();
  }, [location.pathname]);

  if (['/login', '/register'].includes(location.pathname)) {
    return (
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
    )
  }

  return (
    <div className='h-full flex'>
      <LeftSidebar />

      <ChatContextProvider>
        <Routes>

          <Route path='/u/chatting' element={<ChatPage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </ChatContextProvider>
    </div>
  )
}

export default App
