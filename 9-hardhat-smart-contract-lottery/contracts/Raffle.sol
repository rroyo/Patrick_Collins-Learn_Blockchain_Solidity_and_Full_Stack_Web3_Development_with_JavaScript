// Raffle
// Enter the lottery (paying some amount)
// Pick a random winner (verifiably random)
// Winner to be selected every X minutes -> completely automated
// Chainlink Oracle -> Randomness, Automated Execution (Chainlink Keepers)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
  /* State Variables */
  uint256 private immutable i_entranceFee;
  address payable[] private s_players; // Winner has to be payable
  VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
  bytes32 private immutable i_gasLane; // Goerli 150gwei: 0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15
  uint64 private immutable i_subscriptionId;
  uint32 private immutable i_callBackGasLimit;
  uint16 private constant REQUEST_CONFIRMATIONS = 3;
  uint16 private constant NUMBER_WORDS = 1;

  address immutable i_owner;

  /* Events */
  event RaffleEnter(address indexed player);
  event RaffleRequestedRaffleWinner(uint256 indexed requestId);

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

  // This function will be called by the Chainlink keepers network so that
  // this can automatically run without us having to interact with it
  // External functions are a little bit cheaper than public functions
  // since our own contract cannot call these
  function requestRandomWinner() external onlyOwner returns (uint256) {
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
  function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
    // We asked for a single random word, so we'll hard code the index of ranwomWords to 0
    uint256 indexOfWinner = randomWords[0] % s_players.length;
    address payable recentWinner = s_players[indexOfWinner];
  }

  /* View / Pure Functions */
  function getEntranceFee() public view returns (uint256) {
    return i_entranceFee;
  }

  function getPlayer(uint256 index) public view returns (address) {
    return s_players[index];
  }
}
