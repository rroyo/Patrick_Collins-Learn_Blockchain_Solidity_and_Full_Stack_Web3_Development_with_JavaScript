const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

// We're only gonna run this, if we're on a development chain
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer, mockV3Aggregator;
          // { BigNumber: "1000000000000000000" } or 1 ETH
          // Same as ethers.utils.parseUnits("1", 18);
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async function () {
              // const { deployer } = await getNamedAccounts(); <-- We've done
              // it this way so far. Since we declared deployer outside this
              // block we've to get to it in a different way
              deployer = (await getNamedAccounts()).deployer;

              // Runs all deployments with as many tags as we want
              await deployments.fixture(["all"]);

              // Get the most recent deployment of FundMe
              fundMe = await ethers.getContract("FundMe", deployer);

              // Get the most recent deployment of mockV3Aggregator
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );

              // Another way to get the private keys from
              // the accounts key in hardhat.config.js:
              //      const accounts = await ethers.getSigners();
              //      const accountZero = accounts[0];
          });

          describe("constructor", function () {
              it("sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(mockV3Aggregator.address, response);
              });
          });

          describe("fund", function () {
              it("fails if you don't send enough ETH", async function () {
                  // await expect(fundMe.fund()).to.be.reverted;
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  );
              });

              it("updates the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  );

                  // Comparing to BigNumbers, it's necessary to parse both to strings
                  // I think assert compares using ==, so if you compare two different
                  // objects, the assertion will always fail.
                  assert.equal(sendValue.toString(), response.toString());
              });

              it("adds funder to array of funders", async function () {
                  await fundMe.fund({ value: sendValue });
                  const funder = await fundMe.getFunder(0);
                  assert.equal(funder, deployer);
              });
          });

          describe("withdraw", function () {
              // First of all, fund the contract
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraws ETH from a single founder", async function () {
                  // Arrange
                  // using fundMe.provider.getBalance is equivalent to using
                  // ethers.providers.JsonRpcProvider(process.env.RPC_ENDPOINT).getBalance
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw(); // Gas used!
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );
              });

              it("allows to withdraw with multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  // Fund the contract from other accounts
                  for (let i = 1; i < 6; i++) {
                      // First connect to each account, since fundMe is connected to account 0
                      // .connect returns a new contract object, connected to the new account
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );

                      // Now fund the contract from each newly connected account
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.withdraw(); // Gas used!
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // Make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  for (let i = 0; i < fundMe.getFundersLength(); i++) {
                      const address = fundMe.getFunder(i);
                      const accountBalance =
                          await fundMe.getAddressToAmountFunded(address);
                      assert.equal(accountBalance, "0");
                  }
              });

              it("only allows the owner to withdraw", async function () {
                  const attacker = (await ethers.getSigners())[1];
                  const fundMeAttackerContract = await fundMe.connect(attacker);

                  await expect(fundMeAttackerContract.withdraw()).to.be
                      .reverted; //With("FundMe__NotOwner");
              });

              it("cheaperWithdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  // Fund the contract from other accounts
                  for (let i = 1; i < 6; i++) {
                      // First connect to each account, since fundMe is connected to account 0
                      // .connect returns a new contract object, connected to the new account
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );

                      // Now fund the contract from each newly connected account
                      await fundMeConnectedContract.fund({ value: sendValue });
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address);
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw(); // Gas used!
                  const transactionReceipt = await transactionResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = transactionReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(endingFundMeBalance, 0);
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  );

                  // Make sure that the funders are reset properly
                  await expect(fundMe.getFunder(0)).to.be.reverted;

                  const fundersLength = await fundMe.getFundersLength();

                  for (let i = 0; i < fundersLength; i++) {
                      const address = fundMe.getFunder(i);
                      const accountBalance =
                          await fundMe.getAddressToAmountFunded(address);
                      assert.equal(accountBalance, "0");
                  }
              });
          });
      });
