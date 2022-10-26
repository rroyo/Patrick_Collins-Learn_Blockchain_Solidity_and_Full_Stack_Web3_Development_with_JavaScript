const ethers = require("ethers");

async function main() {
  // Our code
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"
  );
  const wallet = new ethers.Wallet(
    "84716e6724f7c0b4d7be9c480eaea10d42aa3adf959ca39a9fe69f3147cc102f",
    provider
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
