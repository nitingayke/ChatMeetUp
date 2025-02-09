import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UserContextProvider from './context/UserContextProvider';
import { SnackbarProvider } from 'notistack';

import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserContextProvider>

      <SnackbarProvider maxSnack={3} >

        <BrowserRouter>
          <App />
        </BrowserRouter>

      </SnackbarProvider>

    </UserContextProvider>
  </StrictMode>
);
