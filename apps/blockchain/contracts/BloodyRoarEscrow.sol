// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IKycSoulboundToken {
    function isVerified(address user) external view returns (bool);
}

contract BloodyRoarEscrow {
    
    enum EscrowState { AWAITING_DELIVERY, COMPLETED, REFUNDED, DISPUTED, RESOLUTION_PROPOSED, CANCELLED }

    struct Escrow {
        address client;
        address worker;
        uint256 rewardAmount;
        uint256 createdAt;
        EscrowState state;
        bool isValue;
        
        // Cancellation state
        bool cancelRequestedByClient;
        bool cancelRequestedByWorker;
        
        // Dispute resolution state
        uint256 disputeResolvedAt; // Timestamp when resolution was proposed
        uint256 clientPercent; // Proposed percentage (0-100) for client
    }

    mapping(bytes32 => Escrow) public escrows;
    
    IKycSoulboundToken public kycToken;
    address public arbiter;
    address public owner;
    bool public paused;
    
    uint256 public constant TIMEOUT_PERIOD = 30 days;
    uint256 public challengePeriod; // e.g., 24 hours

    event Deposited(bytes32 indexed issueId, address indexed client, address indexed worker, uint256 rewardAmount);
    event Released(bytes32 indexed issueId, address indexed worker, uint256 amountReleased);
    event Refunded(bytes32 indexed issueId, address indexed client, uint256 amountRefunded);
    event CancelRequested(bytes32 indexed issueId, address indexed requester);
    event Cancelled(bytes32 indexed issueId);
    event Disputed(bytes32 indexed issueId, address indexed raiser);
    event ResolutionProposed(bytes32 indexed issueId, uint256 clientPercent, uint256 executeAfter);
    event ResolutionExecuted(bytes32 indexed issueId, uint256 clientAmount, uint256 workerAmount);
    event ResolutionOverridden(bytes32 indexed issueId, uint256 clientPercent);
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

    constructor(address _arbiter, address _kycToken, uint256 _challengePeriod) {
        require(_kycToken != address(0), "Invalid KYC Token address");
        arbiter = _arbiter;
        kycToken = IKycSoulboundToken(_kycToken);
        challengePeriod = _challengePeriod;
        owner = msg.sender;
    }

    function setArbiter(address _arbiter) external onlyOwner {
        arbiter = _arbiter;
    }
    
    function setChallengePeriod(uint256 _challengePeriod) external onlyOwner {
        challengePeriod = _challengePeriod;
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        if (_paused) emit Paused(msg.sender);
        else emit Unpaused(msg.sender);
    }

    // Client deposits the reward amount when assigning a worker (Total = 100% of reward)
    function deposit(bytes32 issueId, address worker) external payable whenNotPaused {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(!escrows[issueId].isValue, "Escrow already exists for this issue");
        require(worker != address(0), "Invalid worker address");
        
        // On-chain KYC Check: Skin in the game
        require(kycToken.isVerified(worker), "Worker must be KYC verified");

        escrows[issueId] = Escrow({
            client: msg.sender,
            worker: worker,
            rewardAmount: msg.value,
            createdAt: block.timestamp,
            state: EscrowState.AWAITING_DELIVERY,
            isValue: true,
            cancelRequestedByClient: false,
            cancelRequestedByWorker: false,
            disputeResolvedAt: 0,
            clientPercent: 0
        });

        emit Deposited(issueId, msg.sender, worker, msg.value);
    }
    
    // Mutual Cancel: Request
    function requestCancel(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");
        require(msg.sender == escrow.client || msg.sender == escrow.worker, "Only client or worker can request");
        
        if (msg.sender == escrow.client) {
            escrow.cancelRequestedByClient = true;
        } else {
            escrow.cancelRequestedByWorker = true;
        }
        
        emit CancelRequested(issueId, msg.sender);
        
        // Auto-approve if both requested
        if (escrow.cancelRequestedByClient && escrow.cancelRequestedByWorker) {
            _executeCancel(issueId);
        }
    }
    
    // Mutual Cancel: Approve
    function approveCancel(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");
        
        if (msg.sender == escrow.client) {
            require(escrow.cancelRequestedByWorker, "Worker hasn't requested cancel");
            escrow.cancelRequestedByClient = true;
        } else if (msg.sender == escrow.worker) {
            require(escrow.cancelRequestedByClient, "Client hasn't requested cancel");
            escrow.cancelRequestedByWorker = true;
        } else {
            revert("Only client or worker can approve");
        }
        
        _executeCancel(issueId);
    }
    
    function _executeCancel(bytes32 issueId) internal {
        Escrow storage escrow = escrows[issueId];
        escrow.state = EscrowState.CANCELLED;
        
        // Refund 100% to client
        (bool sent, ) = payable(escrow.client).call{value: escrow.rewardAmount}("");
        require(sent, "Failed to refund Client");
        
        emit Cancelled(issueId);
        emit Refunded(issueId, escrow.client, escrow.rewardAmount);
    }

    // Worker can claim funds if client is inactive after timeout
    function claimTimeout(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.worker, "Only worker can claim timeout");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");
        require(block.timestamp >= escrow.createdAt + TIMEOUT_PERIOD, "Timeout period not yet passed");

        escrow.state = EscrowState.COMPLETED;

        // Send reward to worker
        (bool sentWorker, ) = payable(escrow.worker).call{value: escrow.rewardAmount}("");
        require(sentWorker, "Failed to release worker funds");

        emit Released(issueId, escrow.worker, escrow.rewardAmount);
    }

    // Release funds to the worker (Called by Client)
    function release(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client, "Only client can release funds");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");

        escrow.state = EscrowState.COMPLETED;

        // Release reward to developer
        (bool sentWorker, ) = payable(escrow.worker).call{value: escrow.rewardAmount}("");
        require(sentWorker, "Failed to release worker funds");

        emit Released(issueId, escrow.worker, escrow.rewardAmount);
    }

    // Raise a dispute (Client or Worker) locking the funds
    function raiseDispute(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client || msg.sender == escrow.worker, "Only client or worker can raise dispute");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");

        escrow.state = EscrowState.DISPUTED;

        emit Disputed(issueId, msg.sender);
    }

    // Arbiter proposes a resolution (Partial Release)
    function proposeResolution(bytes32 issueId, uint256 clientPercent) external whenNotPaused {
        require(msg.sender == arbiter, "Only arbiter can propose resolution");
        require(clientPercent <= 100, "Percentage must be <= 100");
        
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.DISPUTED, "Invalid state");

        escrow.state = EscrowState.RESOLUTION_PROPOSED;
        escrow.clientPercent = clientPercent;
        escrow.disputeResolvedAt = block.timestamp;
        
        emit ResolutionProposed(issueId, clientPercent, block.timestamp + challengePeriod);
    }
    
    // Execute resolution after Timelock Challenge Period
    function executeResolution(bytes32 issueId) external whenNotPaused {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.RESOLUTION_PROPOSED, "No resolution proposed");
        require(block.timestamp >= escrow.disputeResolvedAt + challengePeriod, "Challenge period not over");
        
        _distributeResolutionFunds(issueId);
    }
    
    // Owner override in case Arbiter is compromised (SPOF protection)
    function overrideResolution(bytes32 issueId, uint256 clientPercent) external onlyOwner {
        require(clientPercent <= 100, "Percentage must be <= 100");
        
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(escrow.state == EscrowState.DISPUTED || escrow.state == EscrowState.RESOLUTION_PROPOSED, "Invalid state");
        
        escrow.clientPercent = clientPercent;
        
        emit ResolutionOverridden(issueId, clientPercent);
        _distributeResolutionFunds(issueId);
    }
    
    function _distributeResolutionFunds(bytes32 issueId) internal {
        Escrow storage escrow = escrows[issueId];
        escrow.state = EscrowState.COMPLETED; // End state
        
        uint256 clientAmount = (escrow.rewardAmount * escrow.clientPercent) / 100;
        uint256 workerAmount = escrow.rewardAmount - clientAmount;
        
        if (clientAmount > 0) {
            (bool sentClient, ) = payable(escrow.client).call{value: clientAmount}("");
            require(sentClient, "Failed to refund Client");
        }
        
        if (workerAmount > 0) {
            (bool sentWorker, ) = payable(escrow.worker).call{value: workerAmount}("");
            require(sentWorker, "Failed to pay Worker");
        }
        
        emit ResolutionExecuted(issueId, clientAmount, workerAmount);
    }

    function getEscrow(bytes32 issueId) external view returns (Escrow memory) {
        return escrows[issueId];
    }
}
