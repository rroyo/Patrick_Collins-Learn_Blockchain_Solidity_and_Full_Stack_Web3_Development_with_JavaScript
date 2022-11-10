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
    mapping(address => uint256) private s_addressToAmountFunded;
    address[] private s_funders;
    address private immutable i_owner;
    uint256 public constant MINIMUM_USD = 1 * 1e18;

    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not the owner!");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _; // execute the rest of the code in the function that used this modifier
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function withdraw() public payable onlyOwner {
        // Reset the mapping
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        // Reset the array
        s_funders = new address[](0);

        // Withdraw the funds
        // bytes objects are arrays, so they need to be in memory
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        //(bool callSuccess, ) = i_owner.call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public onlyOwner {
        address[] memory funders = s_funders;

        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    function fund() public payable {
        require(
            msg.value.getConverstionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH!"
        );

        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
    }

    function getPrice() public view returns (uint256) {
        return PriceConverter.getPrice(s_priceFeed);
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getFundersLength() public view returns (uint256) {
        return s_funders.length;
    }

    function getAddressToAmountFunded(address funder)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
