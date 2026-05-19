import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Lock, Unlock, RefreshCw, ExternalLink, Loader2, CheckCircle, AlertCircle, Scale, Clock, XCircle } from 'lucide-react';
import { depositFunds, releaseFunds, raiseDispute, getEscrowStatus, claimTimeout, requestCancel, approveCancel } from '@shared/web3/escrowService';
import { IssueStatus, PaymentStatus } from '@bloody-roar/shared-types';

const STATE_STYLES = {
    AWAITING_DELIVERY: { label: 'In Escrow (Active)', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' }, // Map to ESCROWED
    COMPLETED: { label: 'Released', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    REFUNDED: { label: 'Refunded', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    DISPUTED: { label: 'Disputed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    RESOLUTION_PROPOSED: { label: 'Resolution Proposed', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    CANCELLED: { label: 'Cancelled', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20' },
    AWAITING_PAYMENT: { label: 'Not Deposited', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' }, // Map to NONE
    FAILED: { label: 'Payment Failed', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

const EscrowPanel = ({ issue, user, onUpdate }) => {
    const token = localStorage.getItem('token');
    const isClient = user?._id === issue?.clientId?._id || user?.id === issue?.clientId?._id;
    const isDeveloper = user?._id === issue?.assignedDeveloper?._id || user?.id === issue?.assignedDeveloper?._id;
    const isCompleted = issue?.status === IssueStatus.COMPLETED;

    const [escrowState, setEscrowState] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checkingChain, setCheckingChain] = useState(false);
    const [txHash, setTxHash] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (issue?._id) checkOnChainStatus();
    }, [issue?._id]);

    const checkOnChainStatus = async () => {
        setCheckingChain(true);
        try {
            const data = await getEscrowStatus(issue._id.toString());
            setEscrowState(data);
        } catch (err) {
            // Wallet not connected or contract unreachable — use backend state fallback
            setEscrowState({ 
                state: issue?.paymentStatus === PaymentStatus.ESCROWED ? 'AWAITING_DELIVERY' : 
                       issue?.paymentStatus === PaymentStatus.DISPUTED ? 'DISPUTED' : 'AWAITING_PAYMENT', 
                exists: issue?.paymentStatus !== PaymentStatus.NONE 
            });
        } finally {
            setCheckingChain(false);
        }
    };

    // Notify backend after on-chain tx
    const notifyBackend = async (action, hash) => {
        const endpointMap = { deposit: 'deposit', release: 'release', dispute: 'dispute' };
        if (!endpointMap[action]) return; // ignore cancel currently
        await axios.post(`/api/escrow/${endpointMap[action]}`, {
            issueId: issue._id,
            txHash: hash,
            amount: issue?.bounty?.amount,
        }, { headers: { Authorization: `Bearer ${token}` } });
    };

    // Log blockchain errors to backend for audit trail
    const logBlockchainError = async (action, errorMsg) => {
        try {
            await axios.post(`/api/escrow/log-error`, {
                issueId: issue._id,
                action,
                error: errorMsg,
            }, { headers: { Authorization: `Bearer ${token}` } });
        } catch { /* silent */ }
    };

    const handleDeposit = async () => {
        if (!issue?.assignedDeveloper?.walletAddress) {
            setError("Developer has no wallet address. Ask them to connect MetaMask on their profile.");
            return;
        }
        setError('');
        setLoading(true);
        try {
            // Client deposits exactly the reward amount.
            const rewardEth = parseFloat(issue.bounty.amount).toFixed(4);

            const hash = await depositFunds(
                issue._id.toString(),
                issue.assignedDeveloper.walletAddress,
                rewardEth
            );
            setTxHash(hash);
            await notifyBackend('deposit', hash);
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Transaction failed';
            setError(msg);
            logBlockchainError('deposit', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRelease = async () => {
        if (!window.confirm('Release payment to developer? This cannot be undone.')) return;
        setError('');
        setLoading(true);
        try {
            const hash = await releaseFunds(issue._id.toString());
            setTxHash(hash);
            await notifyBackend('release', hash);
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Transaction failed';
            setError(msg);
            logBlockchainError('release', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleDispute = async () => {
        if (!window.confirm('Raise a formal dispute? An arbiter will review the issue and resolve it.')) return;
        setError('');
        setLoading(true);
        try {
            const hash = await raiseDispute(issue._id.toString());
            setTxHash(hash);
            await notifyBackend('dispute', hash);
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Transaction failed';
            setError(msg);
            logBlockchainError('dispute', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleClaimTimeout = async () => {
        if (!window.confirm('Claim funds via timeout? This is only possible if 30 days have passed since deposit.')) return;
        setError('');
        setLoading(true);
        try {
            const hash = await claimTimeout(issue._id.toString());
            setTxHash(hash);
            await notifyBackend('release', hash); // Claim is effectively a release
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Transaction failed. Likely timeout period not reached.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRequestCancel = async () => {
        if (!window.confirm('Request mutual cancellation? This will cancel the escrow. Funds will be returned if the other party approves.')) return;
        setError('');
        setLoading(true);
        try {
            const hash = await requestCancel(issue._id.toString());
            setTxHash(hash);
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Cancel request failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveCancel = async () => {
        if (!window.confirm('Approve cancellation? This will immediately return funds to the client.')) return;
        setError('');
        setLoading(true);
        try {
            const hash = await approveCancel(issue._id.toString());
            setTxHash(hash);
            await checkOnChainStatus();
            onUpdate?.();
        } catch (err) {
            const msg = err.message || 'Cancel approval failed';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const stateStyle = STATE_STYLES[escrowState?.state] || STATE_STYLES['AWAITING_PAYMENT'];
    const daysSinceCreation = escrowState?.createdAt ? Math.floor((Date.now() / 1000 - escrowState.createdAt) / 86400) : 0;
    const canClaimTimeout = isDeveloper && escrowState?.state === 'AWAITING_DELIVERY' && daysSinceCreation >= 30;

    return (
        <div className="bg-bg-secondary rounded-xl border border-border p-5 space-y-4 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Shield size={16} className="text-emerald-400" />
                    <span className="text-[12px] font-medium text-text-muted uppercase tracking-wider">Escrow Payment</span>
                </div>
                <button
                    onClick={checkOnChainStatus}
                    disabled={checkingChain}
                    className="p-1 text-slate-500 hover:text-text-primary transition-colors"
                    title="Refresh on-chain status"
                >
                    <RefreshCw size={12} className={checkingChain ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Amount */}
            <div className="space-y-2 border-b border-border pb-3">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-text-primary">{issue?.bounty?.amount || 0}</span>
                    <span className="text-text-muted font-medium">{issue?.bounty?.currency || 'ETH'}</span>
                </div>
            </div>

            {/* Chain Status Badge */}
            {!checkingChain && escrowState && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${stateStyle.bg} ${stateStyle.border}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${stateStyle.color.replace('text-', 'bg-')}`} />
                    <span className={`text-xs font-medium ${stateStyle.color}`}>{stateStyle.label}</span>
                </div>
            )}
            {checkingChain && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 size={12} className="animate-spin" />
                    Checking chain...
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                    <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                    {error}
                </div>
            )}

            {/* Tx Hash */}
            {txHash && (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <CheckCircle size={12} className="text-emerald-400 flex-shrink-0" />
                    <span className="text-xs text-emerald-400 font-mono truncate">{txHash.slice(0, 20)}...</span>
                    <a
                        href={`https://etherscan.io/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto"
                    >
                        <ExternalLink size={11} className="text-emerald-400" />
                    </a>
                </div>
            )}

            {/* Actions Area */}
            <div className="space-y-2 pt-1">
                {/* Client Actions */}
                {isClient && (
                    <>
                        {/* Deposit —  show when no escrow yet */}
                        {escrowState?.state === 'AWAITING_PAYMENT' && !isCompleted && (
                            <button
                                onClick={handleDeposit}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                Deposit {issue?.bounty?.amount} {issue?.bounty?.currency} On-chain
                            </button>
                        )}

                        {/* Release — show when escrowed */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && (
                            <button
                                onClick={handleRelease}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-text-primary font-semibold rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Unlock size={14} />}
                                Release Payment to Developer
                            </button>
                        )}
                        
                        {/* Cancel Escrow */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && !escrowState?.cancelRequestedByClient && (
                            <button
                                onClick={handleRequestCancel}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-500/20 hover:bg-slate-500/10 text-slate-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Request Cancellation
                            </button>
                        )}
                        
                        {escrowState?.state === 'AWAITING_DELIVERY' && escrowState?.cancelRequestedByClient && !escrowState?.cancelRequestedByWorker && (
                            <div className="text-xs text-center text-slate-400">
                                Waiting for worker to approve cancellation...
                            </div>
                        )}
                        
                        {escrowState?.state === 'AWAITING_DELIVERY' && escrowState?.cancelRequestedByWorker && !escrowState?.cancelRequestedByClient && (
                            <button
                                onClick={handleApproveCancel}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Approve Cancellation
                            </button>
                        )}

                        {/* Dispute — show when escrowed and want to raise conflict */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && (
                            <button
                                onClick={handleDispute}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />}
                                Raise Dispute (Arbiter Review)
                            </button>
                        )}
                    </>
                )}

                {/* Developer Actions */}
                {isDeveloper && (
                    <>
                        {/* Dispute — show when escrowed and client hasn't released */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && (
                            <button
                                onClick={handleDispute}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Scale size={14} />}
                                Raise Dispute
                            </button>
                        )}
                        
                        {/* Cancel Escrow */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && !escrowState?.cancelRequestedByWorker && (
                            <button
                                onClick={handleRequestCancel}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-500/20 hover:bg-slate-500/10 text-slate-300 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                Request Cancellation
                            </button>
                        )}
                        
                        {escrowState?.state === 'AWAITING_DELIVERY' && escrowState?.cancelRequestedByWorker && !escrowState?.cancelRequestedByClient && (
                            <div className="text-xs text-center text-slate-400">
                                Waiting for client to approve cancellation...
                            </div>
                        )}
                        
                        {escrowState?.state === 'AWAITING_DELIVERY' && escrowState?.cancelRequestedByClient && !escrowState?.cancelRequestedByWorker && (
                            <button
                                onClick={handleApproveCancel}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-500/50 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors text-sm disabled:opacity-50"
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                                Approve Cancellation
                            </button>
                        )}

                        {/* Claim Timeout — only after 30 days */}
                        {escrowState?.state === 'AWAITING_DELIVERY' && (
                            <button
                                onClick={handleClaimTimeout}
                                disabled={loading || !canClaimTimeout}
                                className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg transition-colors text-sm disabled:opacity-50 ${
                                    canClaimTimeout 
                                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' 
                                    : 'bg-slate-500/5 text-slate-600 border-slate-500/10 cursor-not-allowed'
                                }`}
                                title={!canClaimTimeout ? `Available after 30 days (${30 - daysSinceCreation} left)` : ''}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Clock size={14} />}
                                Claim Timeout Release {!canClaimTimeout && `(${30 - daysSinceCreation}d)`}
                            </button>
                        )}
                    </>
                )}

                {/* Status Footer Messages */}
                {escrowState?.state === 'DISPUTED' && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400 mt-2">
                        <Scale size={12} className="flex-shrink-0" />
                        A formal dispute is active. An arbiter will review this shortly.
                    </div>
                )}
                
                {escrowState?.state === 'RESOLUTION_PROPOSED' && (
                    <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg text-xs text-purple-400 mt-2">
                        <Clock size={12} className="flex-shrink-0" />
                        Arbiter proposed {escrowState.clientPercent}% to Client. Waiting 24h timelock...
                    </div>
                )}

                {(escrowState?.state === 'COMPLETED' || escrowState?.state === 'REFUNDED' || escrowState?.state === 'CANCELLED') && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 justify-center py-1">
                        <CheckCircle size={12} className="text-emerald-400" />
                        Transaction finalized
                    </div>
                )}
            </div>

            {/* Info footer */}
            <p className="text-[10px] text-[#3d3d3d] leading-tight text-center">
                Secure Escrow v2 · Arbiter Mediated · KYC Checked
            </p>
        </div>
    );
};

export default EscrowPanel;
