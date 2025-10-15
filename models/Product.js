const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    inStock: {
        type: Boolean,
        required: true,
        default: true
    }
});

const Product = mongoose.model('Product', productSchema);

// Initial sample products data
let products = [
  {
    id: "1a2b3c4d-5e6f-7g8h-9i0j-k1l2m3n4o5p6",
    name: "MacBook Pro 16\"",
    description: "Apple MacBook Pro 16-inch with M2 Pro chip, 16GB RAM, 1TB SSD",
    price: 2499.99,
    category: "Electronics",
    inStock: true
  },
  {
    id: "2b3c4d5e-6f7g-8h9i-0j1k-l2m3n4o5p6q7",
    name: "Wireless Gaming Mouse",
    description: "Ergonomic wireless gaming mouse with RGB lighting and programmable buttons",
    price: 79.99,
    category: "Electronics",
    inStock: true
  },
  {
    id: "3c4d5e6f-7g8h-9i0j-1k2l-m3n4o5p6q7r8",
    name: "Stainless Steel Water Bottle",
    description: "1L insulated stainless steel water bottle, keeps drinks cold for 24 hours",
    price: 29.99,
    category: "Sports & Outdoors",
    inStock: false
  },
  {
    id: "4d5e6f7g-8h9i-0j1k-2l3m-n4o5p6q7r8s9",
    name: "Organic Cotton T-Shirt",
    description: "100% organic cotton t-shirt, available in multiple colors and sizes",
    price: 24.99,
    category: "Clothing",
    inStock: true
  },
  {
    id: "5e6f7g8h-9i0j-1k2l-3m4n-o5p6q7r8s9t0",
    name: "Bluetooth Speaker",
    description: "Portable Bluetooth speaker with 20W output and waterproof design",
    price: 89.99,
    category: "Electronics",
    inStock: true
  },
  {
    id: "6f7g8h9i-0j1k-2l3m-4n5o-p6q7r8s9t0u1",
    name: "Yoga Mat",
    description: "Non-slip eco-friendly yoga mat with carrying strap",
    price: 39.99,
    category: "Sports & Outdoors",
    inStock: true
  },
  {
    id: "7g8h9i0j-1k2l-3m4n-5o6p-q7r8s9t0u1v2",
    name: "Desk Lamp",
    description: "LED desk lamp with adjustable brightness and color temperature",
    price: 45.50,
    category: "Home & Office",
    inStock: false
  },
  {
    id: "8h9i0j1k-2l3m-4n5o-6p7q-r8s9t0u1v2w3",
    name: "Coffee Maker",
    description: "Programmable coffee maker with thermal carafe and built-in grinder",
    price: 129.99,
    category: "Home & Kitchen",
    inStock: true
  }
];

// Helper functions for product operations
const generateProductId = () => uuidv4();

const findProductById = (id) => {
  return products.find(product => product.id === id);
};

const findProductIndexById = (id) => {
  return products.findIndex(product => product.id === id);
};

const addProduct = (productData) => {
  const newProduct = {
    id: generateProductId(),
    name: productData.name,
    description: productData.description,
    price: productData.price,
    category: productData.category,
    inStock: productData.inStock
  };
  
  products.push(newProduct);
  return newProduct;
};

const updateProduct = (id, updateData) => {
  const productIndex = findProductIndexById(id);
  if (productIndex === -1) return null;
  
  products[productIndex] = {
    ...products[productIndex],
    ...updateData
  };
  
  return products[productIndex];
};

const deleteProduct = (id) => {
  const productIndex = findProductIndexById(id);
  if (productIndex === -1) return false;
  
  products.splice(productIndex, 1);
  return true;
};

const getAllProducts = () => [...products];

// Export both the mongoose model and the in-memory helpers
module.exports = {
  Product,
  products,
  generateProductId,
  findProductById,
  findProductIndexById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
};
