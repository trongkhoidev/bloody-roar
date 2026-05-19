// scripts/publish.js - Deploy and sync ABI with Frontend
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("🚀 Deploying contracts with the account:", deployer.address);

    const Escrow = await hre.ethers.getContractFactory("BloodyRoarEscrow");
    const escrow = await Escrow.deploy();
    await escrow.waitForDeployment();

    const address = await escrow.getAddress();
    console.log("✅ BloodyRoarEscrow deployed to:", address);

    // Sync with Frontend
    const frontendWeb3Path = path.join(__dirname, "../../client/src/web3");
    if (!fs.existsSync(frontendWeb3Path)) {
        fs.mkdirSync(frontendWeb3Path, { recursive: true });
    }

    // Get the ABI from artifacts
    const artifactPath = path.join(__dirname, "../artifacts/contracts/BloodyRoarEscrow.sol/BloodyRoarEscrow.json");
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

    const config = {
        address: address,
        abi: artifact.abi
    };

    fs.writeFileSync(
        path.join(frontendWeb3Path, "contractConfig.json"),
        JSON.stringify(config, null, 2)
    );

    console.log("📡 Frontend config updated in client/src/web3/contractConfig.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
