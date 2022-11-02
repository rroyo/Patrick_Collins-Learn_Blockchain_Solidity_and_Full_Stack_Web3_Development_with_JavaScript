//SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "./PriceConverter.sol";

error NotOwner();

contract FundMe {
    using PriceConverter for uint256;

    uint256 public constant MINIMUM_USD = 10 * 1e18;

    address[] public funders;
    mapping(address => uint256) public addressToAmountFunded;

    address public immutable i_owner;
    uint public test;

    AggregatorV3Interface public priceFeed;

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        require(msg.value.getConverstionRate(priceFeed) >= MINIMUM_USD, "Didn't send enough!");
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] += msg.value;
    }

    function withdraw() public onlyOwner {
        // Reset the mapping
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        // Reset the array
        funders = new address[](0);
        // Withdraw the funds
        // bytes objects are array, so they need to be in memory
        (bool callSuccess, ) =
        payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
    }

    modifier onlyOwner {
        //require(msg.sender == i_owner, "Sender is not the owner!");
        if(msg.sender != i_owner) { revert NotOwner(); }
        _; // execute the rest of the code in the function that used this modifier
    }

    function getPrice() public view returns(uint256){
        return PriceConverter.getPrice(priceFeed);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}