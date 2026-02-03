
const { ethers } = require("ethers");
require("dotenv").config({ path: "../.env" });

async function main() {
    const infuraKey = process.env.INFURA_API_KEY;
    const privateKey = process.env.PRIVATE_KEY;

    if (!infuraKey || !privateKey) {
        console.log("Missing INFURA_API_KEY or PRIVATE_KEY in .env");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${infuraKey}`);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`Checking balance for: ${wallet.address}`);
    const balance = await provider.getBalance(wallet.address);
    console.log(`Balance: ${ethers.formatEther(balance)} ETH`);
    
    // Check network
    const network = await provider.getNetwork();
    console.log(`Connected to: ${network.name} (Chain ID: ${network.chainId})`);
}

main().catch(console.error);
