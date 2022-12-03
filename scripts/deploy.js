// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  [buyer, seller, inspector, lender] = await ethers.getSigners();
  const AgroMash = await ethers.getContractFactory("AgroMash");
  const agroMash = await AgroMash.deploy();
  await agroMash.deployed();

  console.log(`...deployed AgroMash contract at ${agroMash.address}`);
  console.log(`...Minting 3 AgriBusinesses...\n`);

  const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), "ether");
  };

  // Mint 3 NFTs
  let transaction = await agroMash
    .connect(seller)
    .mint(
      "https://bafybeifqnhsu63ywbt2prliwmihjydgwi2vvhcjt7rjdt726lgxgao7jta.ipfs.w3s.link/1.json"
    );
  await transaction.wait();
  transaction = await agroMash
    .connect(seller)
    .mint(
      "https://bafybeid2ac4o3nlzbxode777ukcms6cjnwkjd7i4pmcarur3ja3wdguqnu.ipfs.w3s.link/2.json"
    );
  await transaction.wait();
  transaction = await agroMash
    .connect(seller)
    .mint(
      "https://bafybeid4ag6pxujqmoln5xjruma2w5k3fujpvjtzjrlnssaakjvnbikq2y.ipfs.w3s.link/3.json"
    );
  await transaction.wait();

  // Deploying the Escrow Contract
  const Escrow = await ethers.getContractFactory("Escrow");
  escrow = await Escrow.deploy(
    agroMash.address,
    seller.address,
    inspector.address,
    lender.address
  );
  await escrow.deployed();
  console.log(`...deployed Escrow contract at ${escrow.address}`);

  // Approving each property
  for (let i = 0; i < 3; i++) {
    let transaction = await agroMash
      .connect(seller)
      .approve(escrow.address, i + 1);
    transaction.wait();
  }

  // Listing properties
  transaction = await escrow
    .connect(seller)
    .list(1, buyer.address, tokens(20), tokens(10));
  transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(2, buyer.address, tokens(17), tokens(7));
  transaction.wait();

  transaction = await escrow
    .connect(seller)
    .list(3, buyer.address, tokens(22), tokens(12));
  transaction.wait();

  console.log("Finished..");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
