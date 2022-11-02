const networkConfig = {
    5: {
        name: "Goerli",
        ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    },
    31337: {
        name: "localhost",
        ethUsdPriceFeed: "0x0",
    },
    137: {
        name: "Polygon",
        ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
    },
};

const developmentChains = ["hardhat", "localhost"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000; // 2000 + 8 zeros
const LOG_SEPARATOR =
    "--------------------------------------------------------";

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
    LOG_SEPARATOR,
};
