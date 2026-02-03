
const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
    const account = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8";
    
    try {
        const balance = await provider.getBalance(account);
        console.log(`Balance of ${account}: ${ethers.formatEther(balance)} ETH`);
        
        const network = await provider.getNetwork();
        console.log(`Connected to Chain ID: ${network.chainId}`);
    } catch (error) {
        console.error("Error connecting to node:", error.message);
    }
}

main();
