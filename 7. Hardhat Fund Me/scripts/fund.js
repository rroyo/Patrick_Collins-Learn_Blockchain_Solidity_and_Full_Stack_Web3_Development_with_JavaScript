const {ethers, getNamedAccounts} = require("hardhat")

async function main() {
    const fundValue = ethers.utils.parseEther("0.001");
    const { deployer } = await getNamedAccounts();
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Funding contract...");
    const transactionResponse = await fundMe.fund({value: fundValue});
    await transactionResponse.wait(1);
    console.log("Funded");
    const balance = await fundMe.getBalance();
    console.log(`Contract balance: ${ethers.utils.formatUnits(balance.toString(), "ether")} ETH`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
