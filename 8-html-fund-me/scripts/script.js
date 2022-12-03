import { ethers } from "./ethers-5.1.esm.min.js";
import { abi, localContractAddress } from "./constants.js";

const connectButton = document.querySelector("#connectButton");
const fundButton = document.querySelector("#fundButton");
const fundAmountInput = document.querySelector("#fundAmountInput");
const withdrawButton = document.querySelector("#withdrawButton");
const balanceButton = document.querySelector("#balanceButton");

let provider;

async function connect() {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    connectButton.innerHTML = "Connected";
  }
}

async function getContract() {
  if (window.ethereum && window.ethereum.isConnected()) {
    provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(localContractAddress, abi, signer);
    return contract;
  }
}

async function getBalance(contract) {
  if (window.ethereum && window.ethereum.isConnected()) {
    return ethers.utils.formatEther(await contract.provider.getBalance(contract.address));
  }
}

async function balance() {
  const contract = await getContract();
  const balance = await getBalance(contract);
  console.log(`Contract balance is: ${balance}`);
}

async function fund() {
  if (window.ethereum && window.ethereum.isConnected()) {
    const fundAmount = fundAmountInput.value;
    const contract = await getContract();
    try {
      const transactionReceipt = await contract.fund({
        value: ethers.utils.parseEther(fundAmount),
      });
      // await transactionResponse.wait(1);
      await listenForTransactionMine(transactionReceipt, provider);
      balance();
    } catch (error) {
      console.error(error);
    }
  }
}

async function withdraw() {
  if (window.ethereum && window.ethereum.isConnected()) {
    const contract = await getContract();
    try {
      const transactionReceipt = await contract.withdraw();
      await listenForTransactionMine(transactionReceipt, provider);
    } catch (error) {
      console.error(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // listen for this transaction to finish
  return new Promise((resolve, _) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      const confirmations = transactionReceipt.confirmations;
      console.log(
        `Completed with ${confirmations} ${confirmations === 1 ? "confirmation" : "confirmations"}`
      );
      resolve();
    });
  });
}

connectButton.addEventListener("click", connect);
fundButton.addEventListener("click", fund);
withdrawButton.addEventListener("click", withdraw);
balanceButton.addEventListener("click", balance);
