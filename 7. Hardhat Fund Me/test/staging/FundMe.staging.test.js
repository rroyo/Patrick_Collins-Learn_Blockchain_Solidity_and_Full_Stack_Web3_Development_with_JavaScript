const { assert } = require("chai");
const { getNamedAccounts, ethers, network } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

// We're only gonna run this, if we're NOT on a development chain
developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe Staging Tests", function () {
          let fundMe, deployer;
          const sendValue = ethers.utils.parseEther("0.001");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async function () {
              const fundTxResponse = await fundMe.fund({ value: sendValue });
              await fundTxResponse.wait(1);
              const withdrawTxResponse = await fundMe.withdraw();
              await withdrawTxResponse.wait(1);

              const endingBalance = await fundMe.provider.getBalance(
                  fundMe.address
              );

              assert.equal(endingBalance.toString(), "0");
          });
      });
