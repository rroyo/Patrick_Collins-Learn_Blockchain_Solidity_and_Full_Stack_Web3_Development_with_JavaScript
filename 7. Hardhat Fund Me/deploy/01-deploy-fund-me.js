const { network } = require("hardhat");
const {
    networkConfig,
    developmentChains,
    LOG_SEPARATOR,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chainId = network.config.chainId;

    // if chainId is X use address Y
    // if chainId is B use address B
    let ethUsdPriceFeedAddress;

    if (developmentChains.includes(network.name)) {
        // GET the previous deployment of the contract MockV3Aggregator
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed;
    }

    // if the contract doesn't exist, we deploy a minimal version for our local testing

    // well what happens when we want to change chains?
    // when going for localhost or hardhat network we want to use a mock
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true, // verbose deployment
        waitConfirmations: network.config.blockConfirmations || 1,
    });

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }

    log(LOG_SEPARATOR);
};

module.exports.tags = ["all", "fundme"];
