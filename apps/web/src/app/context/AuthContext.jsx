import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [isLoading, setIsLoading] = useState(true);

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiration");
    };

    // Check token expiration on mount and on route change
    useEffect(() => {
        const checkTokenExpiration = () => {
            const expiration = localStorage.getItem("tokenExpiration");
            if (token && expiration) {
                if (new Date().getTime() > parseInt(expiration)) {
                    logout();
                }
            }
        };

        checkTokenExpiration();
        // Set up an interval to check periodically
        const interval = setInterval(checkTokenExpiration, 60000);
        return () => clearInterval(interval);
    }, [token]);

    // Fetch User Profile if token exists
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                const expiration = localStorage.getItem("tokenExpiration");
                if (expiration && new Date().getTime() > parseInt(expiration)) {
                    logout();
                    setIsLoading(false);
                    return;
                }

                try {
                    const res = await axios.get(`/api/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const userData = res.data.data;
                    setUser(userData);

                    // Sync FingerprintJS
                    try {
                        const fp = await import("@fingerprintjs/fingerprintjs").then(module => module.default.load());
                        const result = await fp.get();
                        const visitorId = result.visitorId;

                        if (userData && userData.fingerprint !== visitorId) {
                            const updateRes = await axios.put(`/api/auth/profile`,
                                { fingerprint: visitorId },
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            if (updateRes.data.success) {
                                setUser(updateRes.data.data.user);
                            }
                        }
                    } catch (fpError) {
                        console.error("Failed to capture or sync fingerprint:", fpError);
                    }
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    logout();
                }
            }
            setIsLoading(false);
        };
        fetchUser();
    }, [token]);

    const setSession = (token, user) => {
        const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day
        setToken(token);
        setUser(user);
        localStorage.setItem("token", token);
        localStorage.setItem("tokenExpiration", expiresAt.toString());
    };

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
            const res = await axios.post(`/api/auth/web3-login`, {
                walletAddress,
                signature,
                message,
            });

            if (res.data.success) {
                setSession(res.data.data.token, res.data.data.user);
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
            const res = await axios.post(`/api/auth/register`, userData);
            if (res.data.success) {
                setSession(res.data.data.token, res.data.data.user);
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
            const res = await axios.post(`/api/auth/login`, { email, password });
            if (res.data.success) {
                setSession(res.data.data.token, res.data.data.user);
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
