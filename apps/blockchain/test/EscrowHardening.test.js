const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("BloodyRoarEscrow Dual-Deposit Hardening", function () {
    let Escrow, escrow, owner, arbiter, client, worker, other;
    const ISSUE_ID = ethers.encodeBytes32String("test-issue-123");
    
    // 1.0 ETH reward + 0.1 ETH commitment stake = 1.1 ETH total client deposit
    const REWARD = ethers.parseEther("1.0");
    const STAKE = ethers.parseEther("0.1");
    const TOTAL_DEPOSIT = ethers.parseEther("1.1");

    beforeEach(async function () {
        [owner, arbiter, client, worker, other] = await ethers.getSigners();
        Escrow = await ethers.getContractFactory("BloodyRoarEscrow");
        escrow = await Escrow.deploy(arbiter.address);
        await escrow.waitForDeployment();
    });

    describe("Deployment & Configuration", function () {
        it("should set the correct arbiter", async function () {
            expect(await escrow.arbiter()).to.equal(arbiter.address);
        });

        it("should be owned by the deployer", async function () {
            expect(await escrow.owner()).to.equal(owner.address);
        });
    });

    describe("Dual-Deposit Flow", function () {
        it("should allow deposit by client and transition to AWAITING_STAKE", async function () {
            await expect(escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT }))
                .to.emit(escrow, "Deposited")
                .withArgs(ISSUE_ID, client.address, TOTAL_DEPOSIT, REWARD, STAKE);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.client).to.equal(client.address);
            expect(e.worker).to.equal(worker.address);
            expect(e.rewardAmount).to.equal(REWARD);
            expect(e.clientStake).to.equal(STAKE);
            expect(e.workerStake).to.equal(0n);
            expect(e.state).to.equal(0); // AWAITING_STAKE
        });

        it("should allow developer to stake their 10% commitment", async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT });

            await expect(escrow.connect(worker).stakeDeveloper(ISSUE_ID, { value: STAKE }))
                .to.emit(escrow, "Staked")
                .withArgs(ISSUE_ID, worker.address, STAKE);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.workerStake).to.equal(STAKE);
            expect(e.state).to.equal(1); // AWAITING_DELIVERY
        });

        it("should reject staking from a third party or with incorrect stake amount", async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT });

            // Reject third-party stake
            await expect(escrow.connect(other).stakeDeveloper(ISSUE_ID, { value: STAKE }))
                .to.be.revertedWith("Only the assigned worker can stake");

            // Reject incorrect stake amount
            await expect(escrow.connect(worker).stakeDeveloper(ISSUE_ID, { value: ethers.parseEther("0.05") }))
                .to.be.revertedWith("Stake must equal 10% client stake");
        });

        it("should allow client to release funds, paying reward + worker stake to developer, returning client stake to client", async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT });
            await escrow.connect(worker).stakeDeveloper(ISSUE_ID, { value: STAKE });

            const initialClientBalance = await ethers.provider.getBalance(client.address);
            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Client releases funds
            await expect(escrow.connect(client).release(ISSUE_ID))
                .to.emit(escrow, "Released")
                .withArgs(ISSUE_ID, worker.address, REWARD + STAKE);

            const finalClientBalance = await ethers.provider.getBalance(client.address);
            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Worker gets reward + worker stake returned
            expect(finalWorkerBalance - initialWorkerBalance).to.equal(REWARD + STAKE);

            // Client gets client stake returned (minus gas fees, so check approx > 0.09 ETH)
            expect(finalClientBalance - initialClientBalance).to.be.closeTo(STAKE, ethers.parseEther("0.01"));
        });
    });

    describe("Security & Disputes", function () {
        beforeEach(async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT });
            await escrow.connect(worker).stakeDeveloper(ISSUE_ID, { value: STAKE });
        });

        it("should raise a dispute and lock the escrow", async function () {
            await expect(escrow.connect(client).raiseDispute(ISSUE_ID))
                .to.emit(escrow, "Disputed")
                .withArgs(ISSUE_ID, client.address);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.state).to.equal(4); // DISPUTED
        });

        it("should allow arbiter to resolve dispute in favor of Client (refund + developer slash)", async function () {
            await escrow.connect(client).raiseDispute(ISSUE_ID);

            const initialClientBalance = await ethers.provider.getBalance(client.address);
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Resolve in favor of client (refundClient = true)
            await expect(escrow.connect(arbiter).resolveDispute(ISSUE_ID, true))
                .to.emit(escrow, "Refunded")
                .withArgs(ISSUE_ID, client.address, REWARD + STAKE)
                .and.to.emit(escrow, "Slashed")
                .withArgs(ISSUE_ID, worker.address, STAKE);

            const finalClientBalance = await ethers.provider.getBalance(client.address);
            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Client receives reward + client stake
            expect(finalClientBalance - initialClientBalance).to.equal(REWARD + STAKE);

            // Developer's stake is slashed and sent to owner/arbiter
            expect(finalOwnerBalance - initialOwnerBalance).to.equal(STAKE);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.state).to.equal(3); // REFUNDED
        });

        it("should allow arbiter to resolve dispute in favor of Developer (release + client slash)", async function () {
            await escrow.connect(client).raiseDispute(ISSUE_ID);

            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);
            const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Resolve in favor of developer (refundClient = false)
            await expect(escrow.connect(arbiter).resolveDispute(ISSUE_ID, false))
                .to.emit(escrow, "Released")
                .withArgs(ISSUE_ID, worker.address, REWARD + STAKE)
                .and.to.emit(escrow, "Slashed")
                .withArgs(ISSUE_ID, client.address, STAKE);

            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);
            const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

            // Developer receives reward + developer stake
            expect(finalWorkerBalance - initialWorkerBalance).to.equal(REWARD + STAKE);

            // Client's stake is slashed and sent to owner/arbiter
            expect(finalOwnerBalance - initialOwnerBalance).to.equal(STAKE);

            const e = await escrow.getEscrow(ISSUE_ID);
            expect(e.state).to.equal(2); // COMPLETED
        });
    });

    describe("Timeout Mechanism", function () {
        beforeEach(async function () {
            await escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT });
            await escrow.connect(worker).stakeDeveloper(ISSUE_ID, { value: STAKE });
        });

        it("should NOT allow timeout claim before 30 days", async function () {
            await expect(escrow.connect(worker).claimTimeout(ISSUE_ID))
                .to.be.revertedWith("Timeout period not yet passed");
        });

        it("should allow worker to claim after 30 days, returning client stake to client", async function () {
            const THIRTY_DAYS = 30 * 24 * 60 * 60;
            await time.increase(THIRTY_DAYS + 1);

            const initialClientBalance = await ethers.provider.getBalance(client.address);
            const initialWorkerBalance = await ethers.provider.getBalance(worker.address);

            await expect(escrow.connect(worker).claimTimeout(ISSUE_ID))
                .to.emit(escrow, "Released")
                .withArgs(ISSUE_ID, worker.address, REWARD + STAKE);

            const finalClientBalance = await ethers.provider.getBalance(client.address);
            const finalWorkerBalance = await ethers.provider.getBalance(worker.address);

            // Developer gets reward + developer stake (minus transaction gas fee)
            expect(finalWorkerBalance - initialWorkerBalance).to.be.closeTo(REWARD + STAKE, ethers.parseEther("0.01"));

            // Client gets client stake back
            expect(finalClientBalance - initialClientBalance).to.be.closeTo(STAKE, ethers.parseEther("0.01"));
        });
    });

    describe("Circuit Breaker (Pause)", function () {
        it("should allow owner to pause and stop deposits", async function () {
            await escrow.connect(owner).setPaused(true);
            await expect(escrow.connect(client).deposit(ISSUE_ID, worker.address, { value: TOTAL_DEPOSIT }))
                .to.be.revertedWith("Contract is paused");
        });
    });
});
