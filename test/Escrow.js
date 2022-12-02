const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

// writing test cases for the smartcontracts
describe("Escrow", () => {
  let buyer, seller, inspector, lender;
  let agroMash, escrow;

  beforeEach(async () => {
    // setting up accounts
    [buyer, seller, inspector, lender] = await ethers.getSigners();

    // Deploys the AgroMash smartcontract
    const AgroMash = await ethers.getContractFactory("AgroMash");
    agroMash = await AgroMash.deploy();

    // test seller Mint NFT function
    let transaction = await agroMash
      .connect(seller)
      .mint(
        "https://ipfs.io/ipfs/QmTudSYeM7mz3PkYEWXWqPjomRPHogcMFSq7XAvsvsgAP"
      );
    await transaction.wait();

    // Deploy Escrow
    const Escrow = await ethers.getContractFactory("Escrow");
    escrow = await Escrow.deploy(
      agroMash.address,
      seller.address,
      inspector.address,
      lender.address
    );

    // approve AgroBusiness
    transaction = await agroMash.connect(seller).approve(escrow.address, 1);
    await transaction.wait();

    // List AgroProduct
    transaction = await escrow
      .connect(seller)
      .list(1, buyer.address, tokens(10), tokens(5));
    await transaction.wait();
  });

  describe("Deployment", () => {
    it("Returns NFT address", async () => {
      const result = await escrow.nftAddress();
      expect(result).to.be.equal(agroMash.address);
    });

    it("Returns Seller address", async () => {
      const result = await escrow.seller();
      expect(result).to.be.equal(seller.address);
    });

    it("Returns Inspector address", async () => {
      const result = await escrow.inspector();
      expect(result).to.be.equal(inspector.address);
    });

    it("Returns lender address", async () => {
      const result = await escrow.lender();
      expect(result).to.be.equal(lender.address);
    });
  });

  // Describing the listing
  describe("Listing", () => {
    it("Updates as Listed", async () => {
      const result = await escrow.isListed(1);
      expect(result).to.be.equal(true);
    });

    it("Returns the buyer", async () => {
      const result = await escrow.buyer(1);
      expect(result).to.be.equal(buyer.address);
    });

    it("returns the Purchase Price", async () => {
      const result = await escrow.purchasePrice(1);
      expect(result).to.be.equal(tokens(10));
    });

    it("returns the Escrow Amount", async () => {
      const result = await escrow.escrowAmount(1);
      expect(result).to.be.equal(tokens(5));
    });

    it("updates the ownership", async () => {
      expect(await agroMash.ownerOf(1)).to.be.equal(escrow.address);
    });
  });

  // Describing the deposits
  describe("Deposits", () => {
    it("Updates contract Balance", async () => {
      const transaction = await escrow
        .connect(buyer)
        .depositEarnest(1, { value: tokens(5) });
      await transaction.wait();
      const result = await escrow.getBalance(); // balance of smartcontract
      expect(result).to.be.equal(tokens(5));
    });
  });
});
