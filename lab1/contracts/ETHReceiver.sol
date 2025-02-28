// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract ETHReceiver {
    address public owner;

    event Deposit(address indexed sender, uint256 amount);
    event Withdrawal(address indexed owner, uint256 amount);

    constructor() {
        owner = msg.sender; // Set deployer as owner
    }

    receive() external payable {
        require(msg.value > 0, "Must send ETH");
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw() external {
        // Check the address is the owner 
        require(msg.sender == owner, "Only owner can withdraw");
        // Check the fun
        uint256 balance = address(this).balance;
        // Transfer all ETH to the owner
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Withdraw failed");

        emit Withdrawal(owner, balance);
    }
}

// **Contract Requirement**
// - This contract receives ETH and emits event to record that certain address has sent it ETH for how much.
// - The events emitted should include the address and the amount received.
// - There should be one specific address that can withdraw all those funds received
// - no other addresses should be able to withdraw the funds stored in the contract
