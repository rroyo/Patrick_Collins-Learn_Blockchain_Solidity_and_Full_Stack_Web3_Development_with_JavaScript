const ethers = require("ethers");
const fs = require("fs-extra"); // Reading from files

async function main() {
  // Our code
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"
  );
  const wallet = new ethers.Wallet(
    "bab5b96514576523789053e37b111fcd8bb4bfff663eae7323ea35c3853abb60",
    provider
  );
  const abi = fs.readFileSync("./SimpleStorage_sol_SimpleStorage.abi", "utf-8");
  const binary = fs.readFileSync(
    "./SimpleStorage_sol_SimpleStorage.bin",
    "utf-8"
  );
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("Deploying, please wait...");
  const contract = await contractFactory.deploy(); // Wait for contract deployment
  const transactionReceipt = await contract.deployTransaction.wait(1);

  // console.log("Let's deploy with only transaction data!");
  // const nonce = await wallet.getTransactionCount(); // Gets the nonce from the account
  // const tx = {
  //   nonce: nonce,
  //   gasPrice: 20000000000,
  //   gasLimit: 1000000,
  //   to: null,
  //   data: "0x608060405234801561001057600080fd5b5061052c806100206000396000f3fe608060405234801561001057600080fd5b50600436106100625760003560e01c806329cd1d96146100675780632e64cec1146100975780634f2be91f146100b55780636057361d146100d3578063795fff1d146100ef5780638bab8dd51461010b575b600080fd5b610081600480360381019061007c9190610223565b61013b565b60405161008e919061025f565b60405180910390f35b61009f61015f565b6040516100ac919061025f565b60405180910390f35b6100bd610168565b6040516100ca919061025f565b60405180910390f35b6100ed60048036038101906100e89190610223565b610171565b005b610109600480360381019061010491906103c0565b610184565b005b6101256004803603810190610120919061041c565b6101ab565b604051610132919061025f565b60405180910390f35b6002818154811061014b57600080fd5b906000526020600020016000915090505481565b60008054905090565b60006002905090565b8060008190555061018061015f565b5050565b8060018360405161019591906104df565b9081526020016040518091039020819055505050565b6001818051602081018201805184825260208301602085012081835280955050505050506000915090505481565b6000604051905090565b600080fd5b600080fd5b6000819050919050565b610200816101ed565b811461020b57600080fd5b50565b60008135905061021d816101f7565b92915050565b600060208284031215610239576102386101e3565b5b60006102478482850161020e565b91505092915050565b610259816101ed565b82525050565b60006020820190506102746000830184610250565b92915050565b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b6102cd82610284565b810181811067ffffffffffffffff821117156102ec576102eb610295565b5b80604052505050565b60006102ff6101d9565b905061030b82826102c4565b919050565b600067ffffffffffffffff82111561032b5761032a610295565b5b61033482610284565b9050602081019050919050565b82818337600083830152505050565b600061036361035e84610310565b6102f5565b90508281526020810184848401111561037f5761037e61027f565b5b61038a848285610341565b509392505050565b600082601f8301126103a7576103a661027a565b5b81356103b7848260208601610350565b91505092915050565b600080604083850312156103d7576103d66101e3565b5b600083013567ffffffffffffffff8111156103f5576103f46101e8565b5b61040185828601610392565b92505060206104128582860161020e565b9150509250929050565b600060208284031215610432576104316101e3565b5b600082013567ffffffffffffffff8111156104505761044f6101e8565b5b61045c84828501610392565b91505092915050565b600081519050919050565b600081905092915050565b60005b8381101561049957808201518184015260208101905061047e565b838111156104a8576000848401525b50505050565b60006104b982610465565b6104c38185610470565b93506104d381856020860161047b565b80840191505092915050565b60006104eb82846104ae565b91508190509291505056fea2646970667358221220e676891f8aeae002b575d99a4dec88ab021d972f9709c35fc422bd0e721b81cb64736f6c63430008080033",
  //   chainId: 1337, // Try 35777 if this doesn't work
  // };
  //
  // const sentTxResponse = await wallet.sendTransaction(tx);
  // await sentTxResponse.wait(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
