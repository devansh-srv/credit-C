const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Carbon Credit", function(){
  async function deployFixture() {
    const [acc1, acc2] = await ethers.getSigners();
    // const Contract = await ethers.getContractFactory("SimpleCarbonCredit");
    const carbonCredit = await ethers.deployContract("SimpleCarbonCredit");
    await carbonCredit.waitForDeployment();

    return {carbonCredit, acc1, acc2};
  }

  it("Should generate a Carbon Credit", async function () {
    const {carbonCredit, acc1} = await loadFixture(deployFixture);

    const amount = 10;
    const price = 1;

    await carbonCredit.generateCredit(amount, price);
    let nextCreditId = await carbonCredit.getNextCreditId();

    const credit = await carbonCredit.credits(0);

    expect(credit.owner).to.equal(acc1.address);
    expect(credit.amount).to.equal(amount);
    expect(credit.expired).to.be.false;
    expect(credit.price).to.equal(price);
    expect(credit.forSale).to.be.true;

    expect(nextCreditId).to.equal(1);
  });

  it("Should put up for sale", async function () {
    const {carbonCredit, acc1} = await loadFixture(deployFixture);

    const amount = 10;
    const creditId = 0;
    const price = 1;
    
    await carbonCredit.generateCredit(amount, price);

    await carbonCredit.connect(acc1).sellCredit(creditId, price);
    const credit = await carbonCredit.credits(0);

    expect(credit.owner).to.equal(acc1.address);
    expect(credit.forSale).to.be.true;
  })

  it("should sell to another account", async function () {
    const {carbonCredit, acc1, acc2} = await loadFixture(deployFixture);

    const amount = 10;
    const creditId = 0;
    const price = 1;
    const buyPrice = ethers.parseUnits("1","wei")
    await carbonCredit.generateCredit(amount, price);

    await carbonCredit.connect(acc1).sellCredit(creditId, price);
    let credit = await carbonCredit.credits(0);

    expect(credit.owner).to.equal(acc1.address);
    expect(credit.forSale).to.be.true;
    
    //acc2 buying it 
    await expect(() => carbonCredit.connect(acc2).buyCredit(creditId, {value: buyPrice})
      ).to.changeEtherBalances([acc2, acc1],[-price, price]);
    
    credit = await carbonCredit.credits(0);
    expect(credit.owner).to.equal(acc2.address);
    expect(credit.forSale).to.be.false;
  })
});