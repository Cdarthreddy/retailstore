// Import web3 library
import Web3 from 'web3';

// Global variables
let web3;
let contract;
let userAccount;
let contractAddress = "0xda721EC34626d0d8Ae4cFd90dDd3eF6C24a1AE44"; // You'll need to fill this in after deploying the contract
let currentProductId;
// ABI for the RetailStore contract - this will be generated when you compile your contract in Remix
const contractABI = [
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_price",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_imageUrl",
				"type": "string"
			}
		],
		"name": "addProduct",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"name": "ProductAdded",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "address",
				"name": "buyer",
				"type": "address"
			}
		],
		"name": "ProductPurchased",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "purchaseProduct",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_id",
				"type": "uint256"
			}
		],
		"name": "getProduct",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "productCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "products",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "description",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "imageUrl",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "exists",
				"type": "bool"
			},
			{
				"internalType": "address",
				"name": "seller",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]
// Elements
let connectWalletBtn;
let accountSection;
let accountAddress;
let accountBalance;
let contractStatus;
let contractStatusMessage;
let addProductSection;
let productForm;
let productList;
let noProductsMessage;
let purchaseModal;
let closeModal;
let modalProductName;
let modalProductPrice;
let modalProductDescription;
let modalProductImage;
let confirmPurchaseBtn;
let loadingOverlay;
let loadingMessage;

// Initialize the application once the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    connectWalletBtn = document.getElementById('connect-wallet');
    accountSection = document.getElementById('account-section');
    accountAddress = document.getElementById('account-address');
    accountBalance = document.getElementById('account-balance');
    contractStatus = document.getElementById('contract-status');
    contractStatusMessage = document.getElementById('contract-status-message');
    addProductSection = document.getElementById('add-product');
    productForm = document.getElementById('product-form');
    productList = document.getElementById('product-list');
    noProductsMessage = document.getElementById('no-products-message');
    purchaseModal = document.getElementById('purchase-modal');
    closeModal = document.querySelector('.close-modal');
    modalProductName = document.getElementById('modal-product-name');
    modalProductPrice = document.getElementById('modal-product-price');
    modalProductDescription = document.getElementById('modal-product-description');
    modalProductImage = document.getElementById('modal-product-image');
    confirmPurchaseBtn = document.getElementById('confirm-purchase');
    loadingOverlay = document.getElementById('loading-overlay');
    loadingMessage = document.getElementById('loading-message');
    
    // Check if MetaMask is installed
    if (window.ethereum) {
        // Create a Web3 instance
        web3 = new Web3(window.ethereum);
        
        // Check if already connected
        web3.eth.getAccounts().then(accounts => {
            if (accounts.length > 0) {
                connectWallet();
            }
        });
    } else {
        alert('MetaMask is not installed. Please install it to use this application.');
    }
    
    // Event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    productForm.addEventListener('submit', addProduct);
    closeModal.addEventListener('click', closeProductModal);
    confirmPurchaseBtn.addEventListener('click', purchaseProduct);
});

// Connect to MetaMask
async function connectWallet() {
    try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userAccount = accounts[0];
        
        // Update UI
        connectWalletBtn.classList.add('hidden');
        accountSection.classList.remove('hidden');
        accountAddress.textContent = shortenAddress(userAccount);
        
        // Get and display balance
        const balanceWei = await web3.eth.getBalance(userAccount);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        accountBalance.textContent = parseFloat(balanceEth).toFixed(4);
        
        // Connect to contract
        connectToContract();
        
        // Show add product section
        addProductSection.classList.remove('hidden');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        
    } catch (error) {
        console.error("Error connecting to MetaMask:", error);
        alert("Failed to connect to MetaMask. Please try again.");
    }
}
// Handle account change in MetaMask
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected their wallet
        connectWalletBtn.classList.remove('hidden');
        accountSection.classList.add('hidden');
        addProductSection.classList.add('hidden');
        contractStatus.classList.add('hidden');
    } else {
        // Account changed
        userAccount = accounts[0];
        accountAddress.textContent = shortenAddress(userAccount);
        web3.eth.getBalance(userAccount).then((balanceWei) => {
            const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
            accountBalance.textContent = parseFloat(balanceEth).toFixed(4);
        });
    }
}
// Connect to smart contract
function connectToContract() {
    try {
        if (!contractAddress || contractAddress === "") {
            contractStatus.classList.remove('hidden');
            contractStatus.classList.add('error');
            contractStatusMessage.textContent = "Contract address not set. Please deploy the contract first.";
            return;
        }
        
        contract = new web3.eth.Contract(contractABI, contractAddress);
        
        contractStatus.classList.remove('hidden');
        contractStatus.classList.remove('error');
        contractStatus.classList.add('success');
        contractStatusMessage.textContent = "Connected to smart contract";
        
        // Load products
        loadProducts();
        
    } catch (error) {
        console.error("Error connecting to contract:", error);
        contractStatus.classList.remove('hidden');
        contractStatus.classList.add('error');
        contractStatusMessage.textContent = "Failed to connect to smart contract";
    }
}
// Load products from the smart contract
async function loadProducts() {
    try {
        showLoading("Loading products...");
        
        // Get product count
        const productCount = await contract.methods.productCount().call();
        
        // Clear product list
        productList.innerHTML = '';
        
        if (productCount == 0) {
            productList.innerHTML = '<div id="no-products-message">No products available yet</div>';
            hideLoading();
            return;
        }
        
        // Load each product
        for (let i = 1; i <= productCount; i++) {
            try {
                const product = await contract.methods.getProduct(i).call();
                addProductToUI(product);
            } catch (err) {
                console.warn(`Error loading product ${i}:`, err);
                // Continue with other products even if one fails
            }
        }
        
        hideLoading();
    } catch (error) {
        console.error("Error loading products:", error);
        productList.innerHTML = '<div id="no-products-message">Error loading products</div>';
        hideLoading();
    }
}
// Add product to UI
function addProductToUI(product) {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/200x150?text=No+Image'">
        <div class="product-details">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${web3.utils.fromWei(product.price.toString(), 'ether')} ETH</p>
            <p class="product-description">${truncateText(product.description, 100)}</p>
            <button class="buy-button" data-id="${product.id}">Buy Now</button>
        </div>
    `;
    
    // Add event listener to the buy button
    productCard.querySelector('.buy-button').addEventListener('click', () => {
        openProductModal(product);
    });
    
    productList.appendChild(productCard);
}
// Add new product
async function addProduct(event) {
    event.preventDefault();
    
    const name = document.getElementById('product-name').value;
    const price = document.getElementById('product-price').value;
    const description = document.getElementById('product-description').value;
    const imageUrl = document.getElementById('product-image').value;
    
    // Validate inputs
    if (!name || !price || !description || !imageUrl) {
        alert("Please fill in all fields");
        return;
    }
    
    try {
        showLoading("Adding product...");
        
        // Convert price to wei
        const priceWei = web3.utils.toWei(price, 'ether');
        
        // Call contract method
        await contract.methods.addProduct(name, priceWei, description, imageUrl).send({ from: userAccount });
        
        // Reset form
        productForm.reset();
        
        // Reload products
        await loadProducts();
        
        hideLoading();
        alert("Product added successfully!");
    } catch (error) {
        console.error("Error adding product:", error);
        hideLoading();
        alert(`Failed to add product: ${error.message}`);
    }
}
// Open product purchase modal
function openProductModal(product) {
    currentProductId = product.id;
    modalProductName.textContent = product.name;
    modalProductPrice.textContent = web3.utils.fromWei(product.price.toString(), 'ether');
    modalProductDescription.textContent = product.description;
    modalProductImage.src = product.imageUrl;
    modalProductImage.alt = product.name;
    modalProductImage.onerror = function() {
        this.src = 'https://via.placeholder.com/300x200?text=No+Image';
    };
    
    purchaseModal.classList.remove('hidden');
    purchaseModal.classList.add('show');
}
// Close product purchase modal
function closeProductModal() {
    purchaseModal.classList.remove('show');
    purchaseModal.classList.add('hidden');
}
// Purchase product
async function purchaseProduct() {
    try {
        showLoading("Processing purchase...");
        
        // Get product details
        const product = await contract.methods.getProduct(currentProductId).call();
        
        // Call contract method
        await contract.methods.purchaseProduct(currentProductId).send({
            from: userAccount,
            value: product.price
        });
        
        hideLoading();
        closeProductModal();
        
        // Show success message
        alert("Product purchased successfully!");
        
        // Reload products
        await loadProducts();
        
        // Update account balance
        const balanceWei = await web3.eth.getBalance(userAccount);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        accountBalance.textContent = parseFloat(balanceEth).toFixed(4);
        
    } catch (error) {
        console.error("Error purchasing product:", error);
        hideLoading();
        alert(`Failed to purchase product: ${error.message}`);
    }
}
// Helper function to show loading overlay
function showLoading(message) {
    loadingMessage.textContent = message || "Processing...";
    loadingOverlay.classList.remove('hidden');
}
// Helper function to hide loading overlay
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}
// Helper function to shorten address
function shortenAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}
// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}