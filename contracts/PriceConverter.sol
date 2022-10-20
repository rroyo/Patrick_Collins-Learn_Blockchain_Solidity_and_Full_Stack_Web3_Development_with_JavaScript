// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    function getPrice() internal view returns(uint256) {
        // ABI 
        // Address 0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e
        AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        // ETH in terms of USD, an 8 decimal places value
        // 3000.00000000

        // We want to match up the return value to the same units as
        // msg.value (uint256) in the fund() function
        // We need to return the price as an unsigned 18 digits value
        // We do type casting
        return uint256(price * 1e10);
    }

    function getConverstionRate(uint256 ethAmount) internal view returns(uint256) {
        uint256 ethPrice = getPrice();
        // Both ethPrice and ethAmount have 18 additional decimal places
        // We've to divide them by 1e18, or else the result would have 36
        // decimal places
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }
}