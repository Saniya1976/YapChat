import React from 'react';
import ReactDOM from 'react-dom/client';
import "stream-chat-react/dist/css/v2/index.css";
import App from './App.jsx';
import './index.css';  // ✅ IMPORTANT
import { BrowserRouter } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

const queryClient = new QueryClient()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
