import { ethers } from "ethers";

// IMPORTANT: Replace with your actual deployed Contract Address after deployment
// For local dev, hardhat node usually gives a fixed address if deployed deterministic, but we need to deploy first.
// Placeholder:
export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// ABI - Simplified or Full. Ideally import from artifacts if possible, or copy-paste relevant part.
export const CONTRACT_ABI = [
  "function deposit(string issueId, address worker) external payable",
  "function release(string issueId) external",
  "function refund(string issueId) external",
  "function getEscrow(string issueId) external view returns (tuple(address client, address worker, uint256 amount, uint8 state, bool isValue))"
];

export const getEthereumContract = async () => {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    
    // Request account access if needed
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    
    const escrowContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    return escrowContract;
};

export const depositFunds = async (issueId, workerAddress, amountEth) => {
    const contract = await getEthereumContract();
    const amountWei = ethers.parseEther(amountEth.toString());
    
    const tx = await contract.deposit(issueId, workerAddress, { value: amountWei });
    console.log("Deposit Tx:", tx.hash);
    
    // Wait for validation
    await tx.wait();
    return tx.hash;
};

export const releaseFunds = async (issueId) => {
    const contract = await getEthereumContract();
    
    const tx = await contract.release(issueId);
    console.log("Release Tx:", tx.hash);
    
    await tx.wait();
    return tx.hash;
};
