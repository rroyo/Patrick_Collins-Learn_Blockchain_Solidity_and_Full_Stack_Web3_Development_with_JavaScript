//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";
import "hardhat/console.sol";

error FundMe__NotOwner();

/** @title A contract for crown funding
 *  @author Ramon Royo
 *  @notice This contract is to demo a sample funding contract
 *  @dev This implements price feeds as our library
 */
contract FundMe {
    // Type Declarations
    using PriceConverter for uint256;

    // State Variables
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;
    address public immutable i_owner;
    uint256 public constant MINIMUM_USD = 1 * 1e18;

    AggregatorV3Interface public priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not the owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // execute the rest of the code in the function that used this modifier
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function withdraw() public onlyOwner {
        // Reset the mapping
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // Reset the array
        funders = new address[](0);

        // Withdraw the funds
        // bytes objects are arrays, so they need to be in memory
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        //(bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function fund() public payable {
        require(
            msg.value.getConverstionRate(priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );

        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function getPrice() public view returns (uint256) {
        return PriceConverter.getPrice(priceFeed);
    }
}
