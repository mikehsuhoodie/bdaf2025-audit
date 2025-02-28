const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");


describe("ETHReceiver Contract", function () {
    async function deployETHReceiverFixture() {
        // Get signers
        const [owner, addr1] = await ethers.getSigners();

        // Deploy the contract
        const ethReceiver = await ethers.deployContract("ETHReceiver");

        return { ethReceiver, owner, addr1 };
    }

    it("Should set the deployer as the owner", async function () {
        const { ethReceiver, owner } = await loadFixture(deployETHReceiverFixture);
        expect(await ethReceiver.owner()).to.equal(owner.address);
    });

    it("Should receive ETH and emits event including the address and the amount received.", async function () {
        const { ethReceiver, addr1 } = await loadFixture(deployETHReceiverFixture);
        const depositAmount = ethers.parseEther("1");

        await expect(
            addr1.sendTransaction({
                to: await ethReceiver.getAddress(), // Use getAddress() in Ethers v6
                value: depositAmount,
            })
        ).to.emit(ethReceiver, "Deposit").withArgs(addr1.address, depositAmount);

        // Check contract balance
        const contractBalance = await ethers.provider.getBalance(await ethReceiver.getAddress());
        expect(contractBalance).to.equal(depositAmount);
    });

    it("There should be only one specific address(owner) that can withdraw all those funds received.", async function () {
        const { ethReceiver, owner, addr1 } = await loadFixture(deployETHReceiverFixture);
        const depositAmount = ethers.parseEther("2");

        // Send ETH to contract
        await owner.sendTransaction({
            to: await ethReceiver.getAddress(),
            value: depositAmount,
        });

        // Try to withdraw as a non-owner (should fail)
        await expect(
            ethReceiver.connect(addr1).withdraw()
        ).to.be.revertedWith("Only owner can withdraw");

        // Get owner's initial balance
        const initialOwnerBalance = await ethers.provider.getBalance(owner.address);

        // Withdraw as owner
        await expect(ethReceiver.withdraw())
            .to.emit(ethReceiver, "Withdrawal")
            .withArgs(owner.address, depositAmount);

        // Check that contract balance is now 0
        const contractBalance = await ethers.provider.getBalance(await ethReceiver.getAddress());
        expect(contractBalance).to.equal(0);

        // Ensure owner's balance increased
        const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
        expect(finalOwnerBalance).to.be.gt(initialOwnerBalance);
    });
});
