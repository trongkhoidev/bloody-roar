import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    // Fetch User Profile if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    setUser(res.data.data);
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [token]);

    const loginWithWeb3 = async () => {
        try {
            if (!window.ethereum) return alert("Please install MetaMask!");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const walletAddress = await signer.getAddress();

            // Sign Message
            const message = `Login to Bloody Roar Platform: ${new Date().getTime()}`;
            const signature = await signer.signMessage(message);

            // Send to Backend
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/web3-login`, {
                walletAddress,
                signature,
                message,
            });

            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                return true;
            }
        } catch (error) {
            console.error("Login Error:", error);
            alert("Login Failed: " + error.message);
            return false;
        }
    };

    const register = async (userData) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, userData);
            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                return { success: true };
            }
        } catch (error) {
            console.error("Register Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Registration failed"
            };
        }
    };

    const login = async (email, password) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
            if (res.data.success) {
                setToken(res.data.token);
                setUser(res.data.user);
                localStorage.setItem("token", res.data.token);
                return { success: true };
            }
        } catch (error) {
            console.error("Login Error:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Login failed"
            };
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loginWithWeb3,
                register,
                login,
                logout,
                isLoading,
                isAuthenticated: !!user,
                setUser
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
