import { ethers } from 'ethers';
import Issue from '../models/issue.model.js';
import Workspace from '../models/workspace.model.js';
import Audit from '../models/audit.model.js';
import { IssueStatus, PaymentStatus } from "@bloody-roar/shared-types";
import { verifyEscrowTransaction, formatIssueId } from './blockchain.js';

/**
 * Periodically checks for on-chain events that might have been missed by the frontend recording.
 */
export const syncOnChainEvents = async () => {
    try {
        console.log('🔄 Starting Escrow On-Chain Sync...');
        
        // Find all issues that are in status 'OPEN' but might have been escrowed on-chain
        const openIssues = await Issue.find({ 
            status: IssueStatus.OPEN,
            'bounty.isEscrowed': false 
        });
        
        for (const issue of openIssues) {
            const bytes32Id = formatIssueId(issue._id.toString());
            // In a production app, we would call the contract.getEscrowState(bytes32Id)
            // or scan the 'Deposited' events for this bytes32Id.
            // If found, we update the issue status to ONGOING.
        }

        console.log('✅ Escrow Sync Completed.');
    } catch (error) {
        console.error('❌ Escrow Sync Error:', error);
    }
};

/**
 * Listen for real-time events from the blockchain.
 * This is more reliable than polling if the provider supports WebSockets.
 * If using standard HTTP RPC, we use polling.
 */
export const startEventSubscriber = (provider, contractAddress, abi) => {
    const contract = new ethers.Contract(contractAddress, abi, provider);

    console.log('📡 Listening for Escrow events on-chain...');

    contract.on('Deposited', async (issueId, client, amount, event) => {
        try {
            const txHash = event.log.transactionHash;
            console.log(`⛓️  On-Chain Deposit Detected: ${issueId} | Tx: ${txHash}`);
            
            // Note: issueId from contract is bytes32. We need to find which MongoID matches.
            // Since we use zeroPadValue(mongoId, 32), we can try to reverse it or just search.
            // Best is to search for issues where formatIssueId(id) === issueId
            
            // For now, we'll let the recordDeposit controller handle it via frontend,
            // but this listener can be used to auto-verify if the frontend fails.
        } catch (err) {
            console.error('Error in Deposited listener:', err);
        }
    });

    contract.on('Released', async (issueId, worker, amount, event) => {
        console.log(`⛓️  On-Chain Release Detected: ${issueId}`);
    });
};

export default {
    syncOnChainEvents,
    startEventSubscriber
};
