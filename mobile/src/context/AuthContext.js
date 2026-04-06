import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [superAdmin, setSuperAdmin] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const userStr = await AsyncStorage.getItem('user');
      const adminStr = await AsyncStorage.getItem('admin');
      const superAdminStr = await AsyncStorage.getItem('superAdmin');

      if (token && userStr) setUser(JSON.parse(userStr));
      if (token && adminStr) setAdmin(JSON.parse(adminStr));
      if (token && superAdminStr) setSuperAdmin(JSON.parse(superAdminStr));
    } catch (e) {
      console.log('Error loading auth:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (userData, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const loginAdmin = async (adminData, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('admin', JSON.stringify(adminData));
    setAdmin(adminData);
  };

  const loginSuperAdmin = async (data, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('superAdmin', JSON.stringify(data));
    setSuperAdmin(data);
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user', 'admin', 'superAdmin']);
    } catch (e) {
      console.log('AsyncStorage clear error:', e);
    }
    setUser(null);
    setAdmin(null);
    setSuperAdmin(null);
  };

  return (
    <AuthContext.Provider value={{
      user, setUser,
      admin, setAdmin,
      superAdmin, setSuperAdmin,
      isLoading,
      loginUser, loginAdmin, loginSuperAdmin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
