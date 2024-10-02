// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCarbonCredit {

    struct Credit {
        uint256 amount; // Amount of carbon offset (e.g., in tons)
        address owner;  // Current owner of the credit
        bool expired;   // Expiry timestamp
        uint256 price;  // Price in wei (for selling)
        bool forSale;   // Is the credit available for sale?
    }

    mapping(uint256 => Credit) public credits;
    uint256 public nextCreditId;

    // Generate a new carbon credit
    function generateCredit(uint256 amount, uint256 price) external {
        credits[nextCreditId] = Credit({
            amount: amount,
            owner: msg.sender, // Creator becomes the owner
            expired: false,
            price: price,
            forSale: false
        });
        nextCreditId++;
    }

    // Buy a carbon credit listed for sale
    function buyCredit(uint256 creditId) external payable {
        Credit storage credit = credits[creditId];
        require(credit.forSale, "Credit not for sale");
        require(msg.value == credit.price, "Incorrect price");

        // Transfer ETH to the seller
        payable(credit.owner).transfer(msg.value);

        // Transfer ownership to the buyer
        credit.owner = msg.sender;
        credit.forSale = false;  // No longer for sale
    }

    // List a carbon credit for sale
    function sellCredit(uint256 creditId, uint256 price) external {
        Credit storage credit = credits[creditId];
        require(msg.sender == credit.owner, "Only owner can sell");

        credit.price = price;
        credit.forSale = true;
    }

    // Remove a credit from sale
    function removeFromSale(uint256 creditId) external {
        Credit storage credit = credits[creditId];
        require(msg.sender == credit.owner, "Only owner can remove");

        credit.forSale = false;
    }

    // Check if the credit has expired
    function isExpired(uint256 creditId) external view returns (bool) {
        return credits[creditId].expired;
    }

    // Get the owner of a credit
    function getOwner(uint256 creditId) external view returns (address) {
        return credits[creditId].owner;
    }
}
