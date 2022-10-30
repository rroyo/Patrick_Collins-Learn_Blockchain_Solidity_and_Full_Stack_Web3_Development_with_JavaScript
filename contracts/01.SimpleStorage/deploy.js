const ethers = require("ethers");
const fs = require("fs-extra");
const { BigNumber } = require("ethers");
require("dotenv").config();

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
    const binary = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.bin", "utf-8");

    const contractFactory = new ethers.ContractFactory(abi, binary, wallet);

    console.log("Deploying, please wait...");
    const contract = await contractFactory.deploy(); // Wait for contract deployment
    await contract.deployTransaction.wait(1);

    console.log(`Contract Address: ${contract.address}`);

    // Get Number
    const currentFavoriteNumber = await contract.retrieve();
    console.log(currentFavoriteNumber);
    const transactionResponse = await contract.store(BigNumber.from("16"));
    const transactionReceipt = await transactionResponse.wait(1);
    const updatedFavoriteNumber = await contract.retrieve();
    console.log(updatedFavoriteNumber);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
