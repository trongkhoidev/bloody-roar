import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { 
    Shield, Camera, CheckCircle, AlertCircle, 
    User, Scan, RefreshCw, Smartphone, Award
} from "lucide-react";
import { useToast } from "@app/context/ToastContext";

const KycMobileLiveness = () => {
    const { sessionId } = useParams();
    const toast = useToast();
    
    const [step, setStep] = useState(1); // 1: Welcome, 2: ID Scan, 3: Face Scan, 4: Minting, 5: Success
    const [idImage, setIdImage] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [walletAddress, setWalletAddress] = useState("");
    const [faceScanningText, setFaceScanningText] = useState("Position your face in the oval");
    const [progress, setProgress] = useState(0);

    // Mock auto-generate a wallet address if they don't input one
    useEffect(() => {
        const mockAddress = "0x" + Array.from({length: 40}, () => 
            Math.floor(Math.random() * 16).toString(16)).join("");
        setWalletAddress(mockAddress);
    }, []);

    const captureId = () => {
        setAnalyzing(true);
        setTimeout(() => {
            setIdImage("MOCK_ID_CAPTURED");
            setAnalyzing(false);
            toast.success("Document analyzed successfully!");
            setStep(3); // Go to Face Scan
        }, 2000);
    };

    const runFaceScan = () => {
        setStep(4); // Minting phase
        
        // Progress bar simulation
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            
            if (currentProgress === 30) {
                setFaceScanningText("Align face boundaries...");
            } else if (currentProgress === 60) {
                setFaceScanningText("Look directly at the camera...");
            } else if (currentProgress === 90) {
                setFaceScanningText("Liveness check complete!");
            }

            if (currentProgress >= 100) {
                clearInterval(interval);
                triggerWebhookApproval();
            }
        }, 300);
    };

    const triggerWebhookApproval = async () => {
        setAnalyzing(true);
        try {
            console.log("📡 Mobile: Triggering platform eKYC webhook integration...");
            // Directly invoke the webhook endpoint to simulate Sumsub/Persona provider server callback
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/kyc/webhook`, {
                event: "APPROVED",
                sessionId,
                walletAddress
            });

            console.log("🎯 Webhook response:", response.data);
            setStep(5); // Success!
            toast.success("Identity approved and SBT certificate minted!");
        } catch (error) {
            console.error("Webhook simulation failed:", error);
            toast.error("Failed to submit verification status");
            setStep(3); // Reset to Face Scan on failure
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between p-6 font-sans">
            {/* Top Branding */}
            <div className="w-full flex items-center justify-between py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-400 animate-pulse" />
                    <span className="font-bold tracking-tight text-sm">Bloody-Roar Identity</span>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/30">
                    Mobile Portal
                </span>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 w-full flex flex-col justify-center max-w-sm my-8">
                {step === 1 && (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-blue-500/10 rounded-full border border-blue-500/20 mb-2">
                            <Smartphone className="w-16 h-16 text-blue-400" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Cross-Device KYC Portal</h2>
                            <p className="text-slate-400 text-sm">
                                You scanned the pairing QR code. We'll now capture your Identity Document and perform a 3D selfie scan.
                            </p>
                        </div>

                        {/* Optional wallet insertion */}
                        <div className="text-left space-y-2 bg-slate-900 p-4 rounded-xl border border-white/5">
                            <label className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Web3 Wallet (For SBT Minting)</label>
                            <input
                                type="text"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:border-blue-500 outline-none"
                                placeholder="0x..."
                            />
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition"
                        >
                            Begin Verification
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 text-center">
                        <div className="space-y-2 mb-4">
                            <h2 className="text-xl font-bold">Step 1: ID Document Scan</h2>
                            <p className="text-slate-400 text-sm">Position your official ID or Passport card within the guides.</p>
                        </div>

                        {/* Camera Scan Simulation Frame */}
                        <div className="relative aspect-[3/2] w-full border-2 border-dashed border-blue-500/50 rounded-2xl overflow-hidden bg-slate-900 flex items-center justify-center group">
                            {analyzing ? (
                                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center gap-3">
                                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                                    <span className="text-xs text-slate-300">Scanning security micro-features...</span>
                                </div>
                            ) : (
                                <>
                                    {/* Scan guides overlay */}
                                    <div className="absolute inset-4 border border-white/20 rounded-lg pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400 m-2"></div>
                                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400 m-2"></div>
                                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400 m-2"></div>
                                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400 m-2"></div>
                                    
                                    <Scan className="w-12 h-12 text-slate-500" />
                                </>
                            )}
                        </div>

                        <button
                            onClick={captureId}
                            disabled={analyzing}
                            className="w-full py-3 bg-white hover:bg-slate-100 text-slate-950 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                        >
                            <Camera className="w-4 h-4" />
                            Capture Document Card
                        </button>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Step 2: 3D Liveness Scan</h2>
                            <p className="text-slate-400 text-sm">We'll verify you are a live user using a brief selfie video check.</p>
                        </div>

                        {/* Circular Oval Guide */}
                        <div className="relative aspect-square w-64 mx-auto rounded-full border-4 border-dashed border-blue-500/60 overflow-hidden bg-slate-900 flex items-center justify-center">
                            <div className="absolute inset-8 rounded-full border border-white/10 flex items-center justify-center bg-slate-950/20 backdrop-blur-xs">
                                <User className="w-24 h-24 text-slate-600 animate-pulse" />
                            </div>
                        </div>

                        <button
                            onClick={runFaceScan}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
                        >
                            Start Selfie Scan
                        </button>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 text-center">
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Running Liveness check</h2>
                            <p className="text-slate-400 text-sm">{faceScanningText}</p>
                        </div>

                        {/* Animated Face Oval Scanning */}
                        <div className="relative aspect-square w-64 mx-auto rounded-full border-4 border-blue-500 overflow-hidden bg-slate-900 flex items-center justify-center">
                            <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
                            
                            {/* Scanning horizontal line */}
                            <div className="absolute w-full h-1 bg-blue-400/80 blur-[2px] top-1/2 left-0 animate-bounce"></div>

                            <User className="w-24 h-24 text-blue-400" />
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-white/5">
                            <div 
                                className="bg-blue-500 h-full transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {step === 5 && (
                    <div className="space-y-6 text-center">
                        <div className="inline-flex p-4 bg-green-500/10 rounded-full border border-green-500/20 mb-2">
                            <CheckCircle className="w-16 h-16 text-green-400 animate-bounce" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-bold">Verification Finished</h2>
                            <p className="text-slate-400 text-sm">
                                Your ID scans and face biometrics were successfully processed by our identity provider.
                            </p>
                        </div>

                        <div className="bg-slate-900 border border-white/5 rounded-xl p-4 text-left text-xs font-mono space-y-2">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Status:</span>
                                <span className="text-green-400 font-bold">APPROVED</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Token type:</span>
                                <span className="text-slate-200">SBT Certificate</span>
                            </div>
                        </div>

                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20 text-xs text-blue-300">
                            You may now close this browser window. Your desktop workspace will automatically resume.
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer */}
            <div className="w-full text-center text-[10px] text-slate-500 border-t border-white/5 py-4">
                Powered by Bloody-Roar Trust Ledger Integration.
            </div>
        </div>
    );
};

export default KycMobileLiveness;
