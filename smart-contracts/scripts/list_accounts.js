
const hre = require("hardhat");

async function main() {
  const accounts = await hre.ethers.getSigners();
  
  console.log("\nAvailable Hardhat Accounts:");
  console.log("===========================");
  
  for (let i = 0; i < accounts.length; i++) {
    const address = await accounts[i].getAddress();
    // Getting private key from hardhat network is a bit tricky via ethers signers directly if not exposed, 
    // but for default hardhat network it's standard.
    // However, better to just print standard ones if we are on default config, 
    // or use `ethers.provider.listAccounts` (only addresses).
    // Let's rely on the fact that Hardhat Network is deterministic by default.
    console.log(`Account #${i}: ${address}`);
  }
  
  console.log("\nFor default Hardhat Network (Chain ID: 31337), here are the Private Keys for the first 5 accounts:");
  console.log("(Import these into MetaMask to use them)");
  console.log("----------------------------------------------------------------------------------------");
  console.log("Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
  console.log("Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
  console.log("\nAccount #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
  console.log("Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d");
  console.log("\nAccount #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC");
  console.log("Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  console.log("\nAccount #3: 0x90F79bf6EB2c4f870365E785982E1f101E93b906");
  console.log("Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6");
  console.log("\nAccount #4: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65");
  console.log("Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a");
  console.log("----------------------------------------------------------------------------------------");
}

main().catch(console.error);
