import { ethers } from "ethers";
import contractConfig from "./contractConfig.json";

export const CONTRACT_ADDRESS = contractConfig.address;
export const CONTRACT_ABI = contractConfig.abi;

// State enum mapping (matches hardened Solidity enum v2)
export const ESCROW_STATE = {
    0: "AWAITING_DELIVERY",
    1: "COMPLETED",
    2: "REFUNDED",
    3: "DISPUTED",
    4: "RESOLUTION_PROPOSED",
    5: "CANCELLED"
};

/**
 * Converts a MongoDB hex string ID to a bytes32 hex string for the contract.
 * @param {string} mongoId - The 24-character MongoDB ID.
 */
export const formatIssueId = (mongoId) => {
    if (!mongoId) return ethers.ZeroHash;
    const id = mongoId.startsWith('0x') ? mongoId : `0x${mongoId}`;
    return ethers.zeroPadValue(id, 32);
};

// Get connected escrow contract instance
export const getEscrowContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask not installed");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Deposit ETH into escrow, locking funds for a specific issue + worker
export const depositFunds = async (issueId, workerAddress, amountEth) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    // client deposits 100% of reward amount
    const amountWei = ethers.parseEther(amountEth.toString());
    const tx = await contract.deposit(formattedId, workerAddress, { value: amountWei });
    await tx.wait();
    return tx.hash;
};

// Request Mutual Cancel
export const requestCancel = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const tx = await contract.requestCancel(formattedId);
    await tx.wait();
    return tx.hash;
};

// Approve Mutual Cancel
export const approveCancel = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const tx = await contract.approveCancel(formattedId);
    await tx.wait();
    return tx.hash;
};

// Release funds from escrow to the worker (client calls this)
export const releaseFunds = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const tx = await contract.release(formattedId);
    await tx.wait();
    return tx.hash;
};

// Raise a dispute (called by client or worker)
export const raiseDispute = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const tx = await contract.raiseDispute(formattedId);
    await tx.wait();
    return tx.hash;
};

// Worker can claim funds after timeout
export const claimTimeout = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const tx = await contract.claimTimeout(formattedId);
    await tx.wait();
    return tx.hash;
};

// Read current escrow status for an issue
export const getEscrowStatus = async (issueId) => {
    const contract = await getEscrowContract();
    const formattedId = formatIssueId(issueId);
    const escrow = await contract.getEscrow(formattedId);
    return {
        client: escrow.client,
        worker: escrow.worker,
        rewardAmount: ethers.formatEther(escrow.rewardAmount),
        createdAt: Number(escrow.createdAt),
        state: ESCROW_STATE[Number(escrow.state)] || "UNKNOWN",
        exists: escrow.isValue,
        cancelRequestedByClient: escrow.cancelRequestedByClient,
        cancelRequestedByWorker: escrow.cancelRequestedByWorker,
        disputeResolvedAt: Number(escrow.disputeResolvedAt),
        clientPercent: Number(escrow.clientPercent)
    };
};
