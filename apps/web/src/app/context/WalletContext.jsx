import React, { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";

const WalletContext = createContext();

export const useWallet = () => useContext(WalletContext);

export const WalletProvider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [balance, setBalance] = useState("0");
    const [chainId, setChainId] = useState(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const [provider, setProvider] = useState(null);

    // Initialize provider and events
    useEffect(() => {
        if (window.ethereum) {
            const browserProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(browserProvider);

            // Listen for account changes
            window.ethereum.on("accountsChanged", handleAccountsChanged);
            // Listen for chain changes
            window.ethereum.on("chainChanged", () => window.location.reload());

            // Check if already connected (only if user explicitly connected previously)
            const isWalletConnected = localStorage.getItem("walletConnected") === "true";
            if (isWalletConnected) {
                browserProvider.listAccounts().then(accounts => {
                    if (accounts.length > 0) {
                        handleAccountsChanged([accounts[0].address]);
                    }
                }).catch(err => {
                    console.error("Error checking connected accounts:", err);
                });
            }
        }

        return () => {
            if (window.ethereum) {
                window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
            }
        };
    }, []);

    const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
            setAccount(null);
            setBalance("0");
        } else {
            const address = accounts[0];
            setAccount(address);
            updateBalance(address);
        }
    };

    const updateBalance = async (address) => {
        if (window.ethereum) {
            try {
                const browserProvider = new ethers.BrowserProvider(window.ethereum);
                const bal = await browserProvider.getBalance(address);
                setBalance(ethers.formatEther(bal));
            } catch (error) {
                console.error("Failed to fetch balance", error);
            }
        }
    };

    const HARDHAT_NETWORK_ID = '0x7a69'; // 31337
    const HARDHAT_RPC_URL = 'http://127.0.0.1:8545';

    const connectWallet = async () => {
        if (!window.ethereum) {
            alert("Please install MetaMask!");
            return;
        }

        setIsConnecting(true);
        console.log("Connecting wallet...");
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            console.log("Accounts found:", accounts);

            await switchToHardhatNetwork();

            localStorage.setItem("walletConnected", "true");
            handleAccountsChanged(accounts);
        } catch (error) {
            console.error("Error connecting wallet", error);
        } finally {
            setIsConnecting(false);
        }
    };

    const switchToHardhatNetwork = async () => {
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: HARDHAT_NETWORK_ID }],
            });
        } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask.
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: HARDHAT_NETWORK_ID,
                                chainName: 'Hardhat Network',
                                rpcUrls: [HARDHAT_RPC_URL],
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                            },
                        ],
                    });
                } catch (addError) {
                    console.error("Failed to add Hardhat network", addError);
                }
            } else {
                console.error("Failed to switch to Hardhat network", switchError);
            }
        }
    };

    const disconnectWallet = () => {
        localStorage.removeItem("walletConnected");
        setAccount(null);
        setBalance("0");
        // We cannot disconnect from MetaMask programmatically, but we can clear local state
    };

    const shortenAddress = (addr) => {
        if (!addr) return "";
        return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
    };

    return (
        <WalletContext.Provider
            value={{
                account,
                balance,
                chainId,
                isConnecting,
                connectWallet,
                disconnectWallet,
                shortenAddress,
                isConnected: !!account
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};
