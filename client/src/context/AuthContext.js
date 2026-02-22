import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for saved user session on page load
  useEffect(() => {
    const storedUser = localStorage.getItem('serviceFinderUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setCurrentUser(userData);
    localStorage.setItem('serviceFinderUser', JSON.stringify(userData));
    localStorage.setItem('serviceFinderToken', token); // <--- This saves the token!
  };
  
  // Custom logout function to clear user state
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('serviceFinderUser');
  };

  const value = {
    currentUser,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};