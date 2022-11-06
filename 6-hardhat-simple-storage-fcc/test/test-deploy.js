const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("SimpleStorage", function () {
    let simpleStorageFactory, simpleStorage;
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await simpleStorageFactory.deploy();

    });

    it("Should start with a favorite number of 0", async function () {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = "0";
        assert.equal(currentValue.toString(), expectedValue);
    });

    it("Should update when we call store", async function () {
        const updatedValue = "7";
        const transactionResponse = await simpleStorage.store(updatedValue);
        await transactionResponse.wait(1);
        assert.equal(await simpleStorage.retrieve(), updatedValue);
    });

    it("Should add correctly", async function () {
        const expectedValue = 1 + 1;
        const evaluatedValue = await simpleStorage.add();
        assert.equal(expectedValue, evaluatedValue);
    });

    it("Should store a person's favorite number", async function () {
        const name = "Rudolph";
        const favoriteNumber = 23;
        const transactionResponse = await simpleStorage.addPeople(
            name,
            favoriteNumber
        );
        await transactionResponse.wait(1);
        const nameFavoriteNumber = await simpleStorage.nameToFavoriteNumber(
            name
        );
        assert.equal(nameFavoriteNumber, favoriteNumber);
    });
});
