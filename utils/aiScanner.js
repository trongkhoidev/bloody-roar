
// Basic Toxicity/Sensitive Data Scanner
// In production, use OpenAI API or TensorFLow.js Models
export const scanContent = (text) => {
    if (!text) return { flagged: false };

    const lowerText = text.toLowerCase();

    // 1. Private Keys Pattern (Basic Regex for ETH keys)
    const privateKeyPattern = /0x[a-fA-F0-9]{64}/;
    if (privateKeyPattern.test(text)) {
        return { flagged: true, reason: "Potential Private Key detected. Sharing keys is unsafe." };
    }

    // 2. Toxic Keywords (Placeholder)
    const toxicWords = ["scam", "fraud", "steal", "hack your wallet"];
    for (const word of toxicWords) {
        if (lowerText.includes(word)) {
            return { flagged: true, reason: "Content contains flagged keywords." };
        }
    }

    return { flagged: false };
};
