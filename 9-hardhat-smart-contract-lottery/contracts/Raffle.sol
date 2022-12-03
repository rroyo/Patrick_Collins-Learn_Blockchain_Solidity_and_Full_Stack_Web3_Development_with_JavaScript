// Raffle
// Enter the lottery (paying some amount)
// Pick a random winner (verifiably random)
// Winner to be selected every X minutes -> completely automated
// Chainlink Oracle -> Randomness, Automated Execution (Chainlink Keepers)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/AutomationCompatible.sol";

error Raffle__NotEnoughETHEntered();
error Raffle__TransferFailed();

contract Raffle is VRFConsumerBaseV2, AutomationCompatible {
  /* State Variables */
  uint256 private immutable i_entranceFee;
  address payable[] private s_players; // Winner has to be payable
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane; // Goerli 150gwei: 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callBackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint16 private constant NUMBER_WORDS = 1;

  // Lottery Variables
  address private s_recentWinner;

  address immutable i_owner;

  /* Events */
  event RaffleEnter(address indexed player);
  event RaffleRequestedRaffleWinner(uint256 indexed requestId);
  event RaffleWinnerPicked(address indexed winner);

  /* Modifiers */
  modifier onlyOwner() {
    require(msg.sender == i_owner, "Sender is not the owner!");
    _; // execute the rest of the code in the function that used this modifier
  }

  constructor(
    address vrfCoordinatorV2Address,
    uint256 entranceFee,
    bytes32 gasLane,
    uint64 subscriptionId,
    uint32 callBackGasLimit
  ) VRFConsumerBaseV2(vrfCoordinatorV2Address) {
    i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2Address);
    i_entranceFee = entranceFee;
    i_owner = msg.sender;
    i_gasLane = gasLane;
    i_subscriptionId = subscriptionId;
    i_callBackGasLimit = callBackGasLimit;
  }

  function enterRaffle() public payable {
    // Custom errors are a lot more gas efficient than require
    if (msg.value < i_entranceFee) {
      revert Raffle__NotEnoughETHEntered();
    }

    s_players.push(payable(msg.sender)); // Winner has to be payable
    // Emit an event when we update a dynamic array or mapping
    // Named events with the function name reversed
    emit RaffleEnter(msg.sender);
  }

  /**
   * @dev This is the function the Chainlink Keeper nodes call
   * they look for the `upkeepNeeded` to return true.
   * The following should be true in order to return true:
   *  1. Our time interval should have passed
   *  2. The lottery should have at least 1 player, and have some ETH
   *  3. Our subscription is funded with LINK
   *  4. The lottery should be in an "open" state
   */
  function checkUpkeep(
    bytes calldata
  ) external view override returns (bool upkeepNeeded, bytes memory) {
    upkeepNeeded = (block.timestamp - lasTimeStamp) > interval;
  }

  // This function will be called by the Chainlink keepers network so that
  // this can automatically run without us having to interact with it
  // External functions are a little bit cheaper than public functions
  // since our own contract cannot call these
  function requestRandomWinner() external {
    uint256 requestId = i_vrfCoordinator.requestRandomWords(
      i_gasLane,
      i_subscriptionId,
      REQUEST_CONFIRMATIONS,
      i_callBackGasLimit,
      NUMBER_WORDS
    );
    emit RaffleRequestedRaffleWinner(requestId);
  }

  // This fuction is automatically called by requestRandomWinner()
  function fulfillRandomWords(
    uint256 /* requestId */, // We don't use this parameter, but this function needs a uint256 here
    uint256[] memory randomWords
  ) internal override {
    // We asked for a single random word, so we'll hard code the index of ranwomWords to 0
    uint256 indexOfWinner = randomWords[0] % s_players.length; // Returns the index of a player
    address payable recentWinner = s_players[indexOfWinner];
    s_recentWinner = recentWinner;
    (bool success, ) = recentWinner.call{value: address(this).balance}("");
    if (!success) {
      revert Raffle__TransferFailed();
    }
    emit RaffleWinnerPicked(recentWinner);
  }

  /* View / Pure Functions */
  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }

  function getRecentWinner() public view returns (address) {
    return s_recentWinner;
  }
}