// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract BloodyRoarEscrow {
    
    enum EscrowState { AWAITING_PAYMENT, AWAITING_DELIVERY, COMPLETED, REFUNDED }

    struct Escrow {
        address client;
        address worker;
        uint256 amount;
        EscrowState state;
        bool isValue;
    }

    // Mapping IssueId (MongoDB String ID) -> Escrow Struct
    mapping(string => Escrow) public escrows;

    event Deposited(string issueId, address indexed client, uint256 amount);
    event Released(string issueId, address indexed worker, uint256 amount);
    event Refunded(string issueId, address indexed client, uint256 amount);

    // Deposit funds for a specific issue
    // Worker address is passed here to lock it in.
    function deposit(string memory issueId, address worker) external payable { // changed from internal to external
        require(msg.value > 0, "Deposit amount must be greater than 0");
        require(!escrows[issueId].isValue, "Escrow already exists for this issue");

        escrows[issueId] = Escrow({
            client: msg.sender,
            worker: worker,
            amount: msg.value,
            state: EscrowState.AWAITING_DELIVERY,
            isValue: true
        });

        emit Deposited(issueId, msg.sender, msg.value);
    }

    // Release funds to the worker
    // Only the Client can release funds
    function release(string memory issueId) external {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client, "Only client can release funds");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");

        escrow.state = EscrowState.COMPLETED;
        
        (bool sent, ) = payable(escrow.worker).call{value: escrow.amount}("");
        require(sent, "Failed to send Ether");

        emit Released(issueId, escrow.worker, escrow.amount);
    }

    // Refund Logic (Simplified: Client can refund if needed, or implement Arbiter later)
    // For now, let's say only Client can refund to themselves if they cancel? 
    // Or maybe we need a TimeLock? Keeping simple: Client can refund.
    function refund(string memory issueId) external {
        Escrow storage escrow = escrows[issueId];
        require(escrow.isValue, "Escrow does not exist");
        require(msg.sender == escrow.client, "Only client can refund");
        require(escrow.state == EscrowState.AWAITING_DELIVERY, "Invalid state");

        escrow.state = EscrowState.REFUNDED;

        (bool sent, ) = payable(escrow.client).call{value: escrow.amount}("");
        require(sent, "Failed to send Ether");

        emit Refunded(issueId, escrow.client, escrow.amount);
    }

    function getEscrow(string memory issueId) external view returns (Escrow memory) {
        return escrows[issueId];
    }
}
