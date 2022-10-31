const { ethers, run, network } = require("hardhat");

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );
    console.log("Deploying contract...");
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deployed();
    console.log(`Deployed contract to: ${simpleStorage.address}`);

    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        // Ens esperem a estar segurs de que el bloc es queda a la cadena
        await simpleStorage.deployTransaction.wait(6);
        await verify(simpleStorage.address, []);
    }
}

async function verify(contractAddress, args) {
    console.log("Verifying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!");
        } else {
            console.log(e);
        }
    }
}

async function storeNumber(contractAddress, number) {
    const contract = await ethers.getContractAt(
        "SimpleStorage",
        contractAddress
    );
    const current = await contract.retrieve();
    console.log(`Current number: ${current}`);
    console.log("Storing new number...");
    const transactionResponse = await contract.store(number);
    console.log("Retrieving new number...");
    //await transactionResponse.wait(1);
    const newNumber = await contract.retrieve();
    console.log(`New number: ${newNumber}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

//verify("0xb380E7ADbcbdFEbf8C782685aF8268F109271650");

//storeNumber("0xb380E7ADbcbdFEbf8C782685aF8268F109271650", 1813);
