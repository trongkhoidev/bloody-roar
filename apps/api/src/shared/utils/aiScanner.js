
// Advanced Toxicity, sensitive data, API key, and PII Scanner
export const scanContent = (text) => {
    if (!text) return { flagged: false };

    const lowerText = text.toLowerCase();

    // 1. Private Keys Pattern (ETH keys, SSH keys, private key block)
    const privateKeyPattern = /0x[a-fA-F0-9]{64}/;
    if (privateKeyPattern.test(text)) {
        return { flagged: true, reason: "Security Alert: Private Key detected. Sharing credentials/keys is strictly prohibited." };
    }

    // 2. AWS Access Key / Secret Key Patterns
    const awsAccessKey = /AKIA[0-9A-Z]{16}/;
    const awsSecretKey = /aws_secret_access_key|aws_access_key_id/i;
    if (awsAccessKey.test(text) || awsSecretKey.test(text)) {
        return { flagged: true, reason: "Security Alert: AWS Access Key or ID detected. Sharing cloud credentials is unsafe." };
    }

    // 3. Generic API Keys & Tokens
    const genericApiKey = /([a-zA-Z0-9_\-]{20,})([a-zA-Z0-9_\-]{20,})/i; // generic long random strings
    const tokenKeywords = /api_key|client_secret|client_id|access_token|secret_key/i;
    if (tokenKeywords.test(text) && genericApiKey.test(text)) {
        return { flagged: true, reason: "Security Alert: Potential API credential or access token detected." };
    }

    // 4. Personally Identifiable Information (PII)
    // Email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    if (emailPattern.test(text)) {
        return { flagged: true, reason: "Privacy Alert: Personally Identifiable Information (Email address) detected. For your safety, sharing contact info in chat is restricted." };
    }

    // Phone numbers (Generic and Vietnamese international)
    const phonePattern = /(?:\+84|0)(?:\s*\d){9,10}/;
    if (phonePattern.test(text)) {
        return { flagged: true, reason: "Privacy Alert: Personally Identifiable Information (Phone number) detected. For your safety, sharing contact info in chat is restricted." };
    }

    // 5. Toxic/Scam Keywords
    const toxicWords = [
        "scam", "fraud", "steal", "hack your wallet",
        "cặc", "lồn", "đụ", "đéo", "ngu", "chó", "như c", "như l"
    ];
    for (const word of toxicWords) {
        if (lowerText.includes(word)) {
            return { flagged: true, reason: "Content contains flagged keywords (Toxic/Sensitive)." };
        }
    }

    return { flagged: false };
};
