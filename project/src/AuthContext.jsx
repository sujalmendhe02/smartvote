import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");

    if (storedToken && storedRole) {
      setIsLoggedIn(true);
      setRole(storedRole);
      setToken(storedToken);
      fetchProfileData(storedToken, storedRole);
    } else {
      setLoading(false);
    }
  }, []);

  

  const fetchProfileData = async (token, role) => {
    try {
      const endpoint = role === "admin" 
        ? "http://localhost:5000/api/admin/profile"
        : "http://localhost:5000/api/user/profile";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProfileData(response.data.user || response.data.profile);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      setError("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    try {
      const endpoint = role === "admin"
        ? "http://localhost:5000/api/admin/login"
        : "http://localhost:5000/api/user/login";

      const response = await axios.post(endpoint, { email, password });
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      setToken(token);
      setRole(role);
      setIsLoggedIn(true);

      await fetchProfileData(token, role);
      navigate(role === "admin" ? "/admin-dashboard" : "/");
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setIsLoggedIn(false);
    setRole(null);
    setToken(null);
    setProfileData(null);
    navigate("/login");
  };

// Update the signUp function in AuthContext.jsx
const signUp = async (payload, role) => {
  try {
    const endpoint = role === 'admin'
      ? 'http://localhost:5000/api/admin/register'
      : 'http://localhost:5000/api/user/register';

    const response = await axios.post(endpoint, { ...payload, role });
    
    if (response.data.error) {
      throw new Error(response.data.error);
    }
    
    return response.data.message || 'Signup successful!';
  } catch (error) {
    console.error('Signup error:', error);
    throw new Error(error.response?.data?.message || 'Signup failed. Please try again.');
  }
};

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        role,
        setRole,
        profileData,
        setProfileData,
        login,
        logout,
        signUp,
        loading,
        token,
        setToken,
        error,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};