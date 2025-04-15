// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract RetailStore {
    address public owner;
    
    struct Product {
        uint id;
        string name;
        uint price;
        string description;
        string imageUrl;
        bool exists;
        address seller;
    }
    
    mapping(uint => Product) public products;
    uint public productCount = 0;
    
    event ProductAdded(uint id, string name, uint price, address seller);
    event ProductPurchased(uint id, string name, uint price, address buyer);
    
    constructor() {
        owner = msg.sender;
    }
    
    function addProduct(string memory _name, uint _price, string memory _description, string memory _imageUrl) public {
        require(_price > 0, "Price must be greater than 0");
        
        productCount++;
        products[productCount] = Product(
            productCount,
            _name,
            _price,
            _description,
            _imageUrl,
            true,
            msg.sender
        );
        
        emit ProductAdded(productCount, _name, _price, msg.sender);
    }
    
    function purchaseProduct(uint _id) public payable {
        Product memory _product = products[_id];
        require(_product.exists, "Product does not exist");
        require(msg.value >= _product.price, "Insufficient funds sent");
        
        // Send funds to the seller
        payable(_product.seller).transfer(msg.value);
        
        emit ProductPurchased(_id, _product.name, _product.price, msg.sender);
    }
    
    function getProduct(uint _id) public view returns (
        uint id,
        string memory name,
        uint price,
        string memory description,
        string memory imageUrl,
        address seller
    ) {
        Product memory _product = products[_id];
        require(_product.exists, "Product does not exist");
        
        return (
            _product.id,
            _product.name,
            _product.price,
            _product.description,
            _product.imageUrl,
            _product.seller
        );
    }
}