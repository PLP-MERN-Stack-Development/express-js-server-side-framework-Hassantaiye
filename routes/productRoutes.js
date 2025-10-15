// routes/products.js
const express = require('express');
const router = express.Router();

// Import middleware
const { authenticate } = require('../middleware/auth');
const {
  validateProductCreate,
  validateProductUpdate,
  validateProductId,
  ValidationError
} = require('../middleware/validation');

// Import data functions
const {
  products,
  findProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts
} = require('../data/products');

// Apply authentication to all product routes
router.use(authenticate);

// GET /api/products - Get all products
router.get('/', (req, res) => {
  try {
    const allProducts = getAllProducts();
    
    res.json({
      success: true,
      count: allProducts.length,
      data: allProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET /api/products/:id - Get product by ID
router.get('/:id', validateProductId, (req, res, next) => {
  try {
    const productId = req.params.id;
    const product = findProductById(productId);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product
router.post('/', validateProductCreate, (req, res, next) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    
    // Create new product
    const newProduct = addProduct({
      name,
      description,
      price,
      category,
      inStock
    });
    
    console.log(`✅ New product created: ${newProduct.name} (ID: ${newProduct.id})`);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', validateProductId, validateProductUpdate, (req, res, next) => {
  try {
    const productId = req.params.id;
    
    // Check if product exists
    const existingProduct = findProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`
      });
    }
    
    // Update product
    const updatedProduct = updateProduct(productId, req.body);
    
    console.log(`✏️  Product updated: ${updatedProduct.name} (ID: ${productId})`);
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updatedProduct
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', validateProductId, (req, res, next) => {
  try {
    const productId = req.params.id;
    
    const deleted = deleteProduct(productId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: `Product with ID ${productId} not found`
      });
    }
    
    console.log(`🗑️  Product deleted: ID ${productId}`);
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;