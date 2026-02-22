import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Services from './pages/Services';
import ServiceDetails from './pages/ServiceDetails';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard'; 
import Login from './pages/Login';
import Signup from './pages/Signup';
import CompleteProfile from './pages/CompleteProfile';
import About from './pages/About'; // <--- ADDED IMPORT

import ScrollToTop from './components/ScrollToTop'; 

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Smart Dashboard Routing
const DashboardWrapper = () => {
  const { currentUser } = useAuth();
  
  if (currentUser?.role === 'provider') {
    return <ProviderDashboard />;
  }
  return <CustomerDashboard />; 
};

function App() {
  return (
    <AuthProvider>
      <ScrollToTop />
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/service-details/:id" element={<ServiceDetails />} />
        
        {/* --- NEW ABOUT US ROUTE --- */}
        <Route path="/about" element={<About />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardWrapper />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/complete-profile" 
          element={
            <ProtectedRoute>
              <CompleteProfile />
            </ProtectedRoute>
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;