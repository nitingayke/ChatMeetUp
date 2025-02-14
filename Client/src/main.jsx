import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import UserContextProvider from './context/UserContextProvider';
import { SnackbarProvider } from 'notistack';

import './index.css';
import App from './App.jsx';
import LoaderContextProvider from './context/LoaderContextProvider.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <UserContextProvider>

        <SnackbarProvider maxSnack={3} >
          <LoaderContextProvider>

            <App />

          </LoaderContextProvider>
        </SnackbarProvider>

      </UserContextProvider>
    </BrowserRouter>
  </StrictMode>
);
