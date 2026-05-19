const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BloodyRoarEscrow v2: Lazy-Deposit & Zero-Stake Architecture", function () {
    let Escrow, escrow, KycToken, kycToken, owner, arbiter, client, worker, other;
    const ISSUE_ID = ethers.encodeBytes32String("test-issue-123");
    
    // 1.0 ETH bounty reward
    const REWARD = ethers.parseEther("1.0");
    const CHALLENGE_PERIOD = 24 * 60 * 60; // 24 hours

    beforeEach(async function () {
        [owner, arbiter, client, worker, other] = await ethers.getSigners();
        
        // 1. Deploy KYC Token
        KycToken = await ethers.getContractFactory("KycSoulboundToken");
        kycToken = await KycToken.deploy("KYC Token", "KYC");
        await kycToken.waitForDeployment();
        
        // Mint KYC to worker so they can be assigned tasks
        await kycToken.mintKycToken(worker.address);

        // 2. Deploy Escrow Contract
        Escrow = await ethers.getContractFactory("BloodyRoarEscrow");
        escrow = await Escrow.deploy(arbiter.address, await kycToken.getAddress(), CHALLENGE_PERIOD);
        await escrow.waitForDeployment();
    });

    describe("Deployment & Configuration", function () {
        it("should set the correct arbiter and KYC token", async function () {
            expect(await escrow.arbiter()).to.equal(arbiter.address);
            expect(await escrow.kycToken()).to.equal(await kycToken.getAddress());
            expect(await escrow.challengePeriod()).to.equal(CHALLENGE_PERIOD);
        });

        it("should be owned by the deployer", async function () {
            expect(await escrow.owner()).to.equal(owner.address);
        });
    });

    describe("On-chain KYC & Lazy-Deposit Flow", function () {
        it("should allow deposit and assign worker if worker has KYC token", async function () {
            await expect(escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD }))
                .to.emit(escrow, "Deposited")
                .withArgs(ISSUE_ID, client.address, worker.address, REWARD);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.client).to.equal(client.address);
            expect(e.worker).to.equal(worker.address);
            expect(e.rewardAmount).to.equal(REWARD);
            expect(e.state).to.equal(0); // AWAITING_DELIVERY (no legacy AWAITING_STAKE)
        });
        
        it("should REJECT deposit if worker is NOT KYC verified", async function () {
            // "other" does not have KYC token
            await expect(escrow.connect(client).deposit(ISSUE_ID, other.address, { value: REWARD }))
                .to.be.revertedWith("Worker must be KYC verified");
        });

        it("should allow client to release funds, paying 100% reward to developer", async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD });

            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Client releases funds
            await expect(escrow.connect(client).release(ISSUE_ID))
                .to.emit(escrow, "Released")
                .withArgs(ISSUE_ID, worker.address, REWARD);

            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Worker gets 100% reward
            expect(finalWorkerBalance - initialWorkerBalance).to.equal(REWARD);
        });
    });
    
    describe("Mutual Cancel Mechanism", function () {
        beforeEach(async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD });
        });

        it("should allow client to request cancel, but funds lock until worker approves", async function () {
            await expect(escrow.connect(client).requestCancel(ISSUE_ID))
                .to.emit(escrow, "CancelRequested")
                .withArgs(ISSUE_ID, client.address);
                
            let e = await escrow.getEscrow(ISSUE_ID);
            expect(e.cancelRequestedByClient).to.be.true;
            expect(e.cancelRequestedByWorker).to.be.false;
            expect(e.state).to.equal(0); // Still AWAITING_DELIVERY
            
            // Worker approves
            const initialClientBalance = await ethers.provider.getBalance(client.address);
            await expect(escrow.connect(worker).approveCancel(ISSUE_ID))
                .to.emit(escrow, "Cancelled")
                .withArgs(ISSUE_ID)
                .and.to.emit(escrow, "Refunded")
                .withArgs(ISSUE_ID, client.address, REWARD);
                
            e = await escrow.getEscrow(ISSUE_ID);
            expect(e.state).to.equal(5); // CANCELLED
        });
        
        it("should auto-cancel if both parties call requestCancel", async function () {
            await escrow.connect(worker).requestCancel(ISSUE_ID);
            await expect(escrow.connect(client).requestCancel(ISSUE_ID))
                .to.emit(escrow, "Cancelled")
                .withArgs(ISSUE_ID);
        });
    });

    describe("Disputes & Partial Release Timelock", function () {
        beforeEach(async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD });
            await escrow.connect(client).raiseDispute(ISSUE_ID);
        });

        it("should allow arbiter to propose resolution (Partial Release)", async function () {
            // Propose 70% to client, 30% to worker
            await expect(escrow.connect(arbiter).proposeResolution(ISSUE_ID, 70))
                .to.emit(escrow, "ResolutionProposed");

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.state).to.equal(4); // RESOLUTION_PROPOSED
            expect(e.clientPercent).to.equal(70);
        });

        it("should NOT allow execution before challenge period ends", async function () {
            await escrow.connect(arbiter).proposeResolution(ISSUE_ID, 70);
            
            // Try to execute immediately
            await expect(escrow.connect(other).executeResolution(ISSUE_ID))
                .to.be.revertedWith("Challenge period not over");
        });
        
        it("should allow anyone to execute after challenge period ends and split funds correctly", async function () {
            await escrow.connect(arbiter).proposeResolution(ISSUE_ID, 70);
            
            // Fast forward time by 24h + 1s
            await time.increase(CHALLENGE_PERIOD + 1);
            
            const initialClientBalance = await ethers.provider.getBalance(client.address);
            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Execute (can be called by anyone, e.g., 'other')
            await expect(escrow.connect(other).executeResolution(ISSUE_ID))
                .to.emit(escrow, "ResolutionExecuted")
                .withArgs(ISSUE_ID, ethers.parseEther("0.7"), ethers.parseEther("0.3"));

            const finalClientBalance = await ethers.provider.getBalance(client.address);
            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Check math: Client gets 70%, Worker gets 30%
            expect(finalClientBalance - initialClientBalance).to.equal(ethers.parseEther("0.7"));
            expect(finalWorkerBalance - initialWorkerBalance).to.equal(ethers.parseEther("0.3"));
        });
        
        it("should allow Owner to override resolution in case Arbiter is compromised", async function () {
            await escrow.connect(arbiter).proposeResolution(ISSUE_ID, 70); // Arbiter compromised, gave 70% to client
            
            const initialClientBalance = await ethers.provider.getBalance(client.address);
            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);
            
            // Owner steps in before 24h ends and overrides to 10% client, 90% worker
            await expect(escrow.connect(owner).overrideResolution(ISSUE_ID, 10))
                .to.emit(escrow, "ResolutionOverridden")
                .withArgs(ISSUE_ID, 10)
                .and.to.emit(escrow, "ResolutionExecuted")
                .withArgs(ISSUE_ID, ethers.parseEther("0.1"), ethers.parseEther("0.9"));
                
            const finalClientBalance = await ethers.provider.getBalance(client.address);
            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            expect(finalClientBalance - initialClientBalance).to.equal(ethers.parseEther("0.1"));
            expect(finalWorkerBalance - initialWorkerBalance).to.equal(ethers.parseEther("0.9"));
        });
    });

    describe("Timeout Mechanism", function () {
        beforeEach(async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD });
        });

        it("should NOT allow timeout claim before 30 days", async function () {
            await expect(escrow.connect(worker).claimTimeout(ISSUE_ID))
                .to.be.revertedWith("Timeout period not yet passed");
        });

        it("should allow worker to claim after 30 days", async function () {
            const THIRTY_DAYS = 30 * 24 * 60 * 60;
            await time.increase(THIRTY_DAYS + 1);

            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

            await expect(escrow.connect(worker).claimTimeout(ISSUE_ID))
                .to.emit(escrow, "Released")
                .withArgs(ISSUE_ID, worker.address, REWARD);

            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            expect(finalWorkerBalance - initialWorkerBalance).to.be.closeTo(REWARD, ethers.parseEther("0.01"));
        });
    });

    describe("Circuit Breaker (Pause)", function () {
        it("should allow owner to pause and stop deposits", async function () {
            await escrow.connect(owner).setPaused(true);
            await expect(escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: REWARD }))
                .to.be.revertedWith("Contract is paused");
        });
    });
});
