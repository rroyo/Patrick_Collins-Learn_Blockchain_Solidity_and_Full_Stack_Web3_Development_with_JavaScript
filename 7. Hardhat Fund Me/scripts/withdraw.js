const { ethers, getNamedAccounts } = require("hardhat");

async function main() {
    const { deployer } = getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    const balance = await fundMe.getBalance();
    console.log(`Withdrawing ${ethers.utils.formatUnits(balance.toString(), "ether")} ETH`);
    const withdrawTx = await fundMe.withdraw();
    await withdrawTx.wait(1);
    console.log("Funds withdrawn");
    const newBalance = await fundMe.getBalance();
    console.log(`Contract balance: ${ethers.utils.formatUnits(newBalance.toString(), "ether")} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch(function (error) {
        console.error(error);
        process.exit(1);
    });
