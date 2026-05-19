// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BloodyRoarEscrow {
    
    enum EscrowState { AWAITING_STAKE, AWAITING_DELIVERY, COMPLETED, REFUNDED, DISPUTED }

    struct Escrow {
        address client;
        address worker;
        uint256 rewardAmount;
        uint256 clientStake;
        uint256 workerStake;
        uint256 createdAt;
        EscrowState state;
        bool isValue;
    }

    mapping(bytes32 => Escrow) public escrows;
    address public arbiter;
    address public owner;
    bool public paused;
    uint256 public constant TIMEOUT_PERIOD = 30 days;

    event Deposited(bytes32 indexed issueId, address indexed client, uint256 totalAmount, uint256 rewardAmount, uint256 clientStake);
    event Staked(bytes32 indexed issueId, address indexed worker, uint256 workerStake);
    event Released(bytes32 indexed issueId, address indexed worker, uint256 amountReleased);
    event Refunded(bytes32 indexed issueId, address indexed client, uint256 amountRefunded);
    event Disputed(bytes32 indexed issueId, address indexed client);
    event Slashed(bytes32 indexed issueId, address indexed faultyParty, uint256 slashedAmount);
    event Paused(address account);
    event Unpaused(address account);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor(address _arbiter) {
        arbiter = _arbiter;
        owner = msg.sender;
    }

    function setArbiter(address _arbiter) external onlyOwner {
        arbiter = _arbiter;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        if (_paused) emit Paused(msg.sender);
        else emit Unpaused(msg.sender);
    }

    // Client deposits the reward amount + 10% commitment stake (Total = 110% of reward)
    function deposit(bytes32 issueId, address worker) external payable whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(!escrows[issueId].isValue, "Escrow already exists for this issue");

        // rewardAmount is 100/110 of the total deposit value. clientStake is 10/110.
        uint256 rewardAmount = (msg.value * 100) / 110;
        uint256 clientStake = msg.value - rewardAmount;

        escrows[issueId] = Escrow({
            client: msg.sender,
            worker: worker,
            rewardAmount: rewardAmount,
            clientStake: clientStake,
            workerStake: 0,
            createdAt: block.timestamp,
            state: EscrowState.AWAITING_STAKE,
            isValue: true
        });

        emit Deposited(issueId, msg.sender, msg.value, rewardAmount, clientStake);
    }

    // Worker stakes their 10% commitment stake
    function stakeDeveloper(bytes32 issueId) external payable whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.worker, "Only the assigned worker can stake");
        require(escrow.state == EscrowState.AWAITING_STAKE, "Invalid state for staking");
        require(msg.value == escrow.clientStake, "Stake must equal 10% client stake");

        escrow.workerStake = msg.value;
        escrow.state = EscrowState.AWAITING_DELIVERY;

        emit Staked(issueId, msg.sender, msg.value);
    }

    // Worker can claim funds if client is inactive after timeout
    function claimTimeout(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.worker, "Only worker can claim timeout");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");
        require(block.timestamp >= escrow.createdAt + TIMEOUT_PERIOD, "Timeout period not yet passed");

        escrow.state = EscrowState.COMPLETED;

        // Return client stake to client
        (bool sentClient, ) = payable(escrow.client).call{value: escrow.clientStake}("");
        require(sentClient, "Failed to refund client stake");

        // Send reward + worker stake to worker
        uint256 releaseVal = escrow.rewardAmount + escrow.workerStake;
        (bool sentWorker, ) = payable(escrow.worker).call{value: releaseVal}("");
        require(sentWorker, "Failed to release worker funds");

        emit Released(issueId, escrow.worker, releaseVal);
    }

    // Release funds to the worker (Called by Client)
    function release(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client, "Only client can release funds");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");

        escrow.state = EscrowState.COMPLETED;

        // Refund client stake back to client
        (bool sentClient, ) = payable(escrow.client).call{value: escrow.clientStake}("");
        require(sentClient, "Failed to refund client stake");

        // Release reward + worker stake to developer
        uint256 releaseVal = escrow.rewardAmount + escrow.workerStake;
        (bool sentWorker, ) = payable(escrow.worker).call{value: releaseVal}("");
        require(sentWorker, "Failed to release worker funds");

        emit Released(issueId, escrow.worker, releaseVal);
    }

    // Raise a dispute (Client or Worker) locking the funds
    function raiseDispute(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client || msg.sender == escrow.worker, "Only client or worker can raise dispute");
        require(
            escrow.state == EscrowState.AWAITING_DELIVERY || escrow.state == EscrowState.AWAITING_STAKE,
            "Invalid state"
        );

        escrow.state = EscrowState.DISPUTED;

        emit Disputed(issueId, msg.sender);
    }

    // Arbiter resolves dispute
    // refundClient = true: Client wins. Slashed developer stake goes to owner/arbiter as dispute fee.
    // refundClient = false: Developer wins. Slashed client stake goes to owner/arbiter as dispute fee.
    function resolveDispute(bytes32 issueId, bool refundClient) external whenNotPaused {
        require(msg.sender == arbiter, "Only arbiter can resolve disputes");
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.DISPUTED, "Invalid state");

        if (refundClient) {
            escrow.state = EscrowState.REFUNDED;

            // Return reward + client stake to Client
            uint256 refundVal = escrow.rewardAmount + escrow.clientStake;
            (bool sent, ) = payable(escrow.client).call{value: refundVal}("");
            require(sent, "Failed to refund Client");

            // Slash developer stake: send to owner/arbiter
            if (escrow.workerStake > 0) {
                (bool sentArb, ) = payable(owner).call{value: escrow.workerStake}("");
                require(sentArb, "Failed to transfer slashed worker stake");
                emit Slashed(issueId, escrow.worker, escrow.workerStake);
            }

            emit Refunded(issueId, escrow.client, refundVal);
        } else {
            escrow.state = EscrowState.COMPLETED;

            // Send reward + worker stake to Developer
            uint256 releaseVal = escrow.rewardAmount + escrow.workerStake;
            (bool sent, ) = payable(escrow.worker).call{value: releaseVal}("");
            require(sent, "Failed to release to Developer");

            // Slash client stake: send to owner/arbiter
            if (escrow.clientStake > 0) {
                (bool sentArb, ) = payable(owner).call{value: escrow.clientStake}("");
                require(sentArb, "Failed to transfer slashed client stake");
                emit Slashed(issueId, escrow.client, escrow.clientStake);
            }

            emit Released(issueId, escrow.worker, releaseVal);
        }
    }

    function getEscrow(bytes32 issueId) external view returns (Escrow memory) {
        return escrows[issueId];
    }
}
