// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./SimpleStorage.sol";

contract StorageFactory {
    // This array will contain all the new contracts
    SimpleStorage[] public simpleStorageArray;

    function createSimpleStorageContract() public {
        simpleStorageArray.push(new SimpleStorage());
    }

    function sfStore(
        uint256 _simpleStorageIndex,
        uint256 _simpleStorageNumber
    ) public {
        return simpleStorageArray[_simpleStorageIndex].store(_simpleStorageNumber);
    }

    function sfRetrieve(uint256 _simpleStorageIndex)
        public view returns (uint256)
    {
        return simpleStorageArray[_simpleStorageIndex].retrieve();
    }
}