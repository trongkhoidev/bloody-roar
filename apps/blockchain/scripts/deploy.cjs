// deploy.cjs — Deploy BloodyRoarEscrow to local Hardhat node
const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    const Escrow = await hre.ethers.getContractFactory("BloodyRoarEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const address = await escrow.getAddress();
    console.log("✅ BloodyRoarEscrow deployed to:", address);
    console.log("\nUpdate your .env / escrowService.js with:");
    console.log(`CONTRACT_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
