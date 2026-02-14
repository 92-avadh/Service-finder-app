import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // Import Router here
import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Replace with your actual Client ID
const GOOGLE_CLIENT_ID = "526023266128-1gn5fvgi59ico7nu6cen0o9jqvti2msg.apps.googleusercontent.com"; 

root.render(
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <BrowserRouter> {/* This is the ONLY Router in your app */}
      <App />
    </BrowserRouter>
  </GoogleOAuthProvider>
);