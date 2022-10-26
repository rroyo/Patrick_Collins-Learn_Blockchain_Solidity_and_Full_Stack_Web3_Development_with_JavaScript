const ethers = require("ethers");

async function main() {
  // Our code
  const provider = new ethers.providers.JsonRpcProvider(
    "http://127.0.0.1:7545"
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
