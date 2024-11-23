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

    error CreditNotForSale();
    error PriceNotMet();
    error OnlyOwnerCanSell();
    error OnlyOwnerCanRemove();
    error CreditDoesntExist();

    mapping(uint256 => Credit) public credits;
    uint256 nextCreditId;

    // Generate a new carbon credit
    function generateCredit(uint256 amount, uint256 price) external {
        credits[nextCreditId] = Credit({
            amount: amount,
            owner: msg.sender, // Creator becomes the owner
            expired: false,
            price: price,
            forSale: true
        });
        nextCreditId++;
    }

    // Buy a carbon credit listed for sale
    function buyCredit(uint256 creditId) external payable {
        Credit storage credit = credits[creditId];
        if( credit.forSale == false){
            revert CreditNotForSale();
        }

        // require(msg.value == credit.price, "Incorrect price");
        if( msg.value != credit.price){
            revert PriceNotMet();
        }

        // Transfer ETH to the seller
        payable(credit.owner).transfer(msg.value);

        // Transfer ownership to the buyer
        credit.owner = msg.sender;
        credit.forSale = false;  // No longer for sale
    }

    // List a carbon credit for sale
    function sellCredit(uint256 creditId, uint256 price) external {
        Credit storage credit = credits[creditId];

        if (credit.owner == address(0)) {
            revert CreditDoesntExist();
        }

        if(msg.sender != credit.owner){
            revert OnlyOwnerCanSell();
        }

        credit.price = price;
        credit.forSale = true;
    }

    // Remove a credit from sale
    function removeFromSale(uint256 creditId) external {
        Credit storage credit = credits[creditId];
        // require(msg.sender == credit.owner, "Only owner can remove");
        if(msg.sender != credit.owner){
            revert OnlyOwnerCanRemove();
        }

        credit.forSale = false;
    }

    // Check if the credit has expired
    function isExpired(uint256 creditId) external view returns (bool) {
        return credits[creditId].expired;
    }

    // Check if the credit has expired
    function Expire(uint256 creditId) external{
        credits[creditId].expired = true;
    }

    // Get the owner of a credit
    function getOwner(uint256 creditId) external view returns (address) {
        return credits[creditId].owner;
    }

    // Get next credit ID
    function getNextCreditId() external view returns (uint256) {
        return nextCreditId;
    }

    function getPrice(uint256 creditId) external view returns (uint256) {
        return credits[creditId].price; 
    }
}