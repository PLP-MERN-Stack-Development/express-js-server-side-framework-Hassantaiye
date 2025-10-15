const express = require('express');
const router = express.Router();

const {
  getAllProducts,
  findProductById,
  addProduct,
  updateProduct,
  deleteProduct
} = require('../models/product');

const { asyncHandler, NotFoundError, ValidationError } = require('../middleware/errors');

// GET /api/products
// supports: ?category=Electronics&search=term&page=1&limit=10
router.get(
  '/',
  asyncHandler(async (req, res) => {
    let items = getAllProducts();

    // filter by category
    if (req.query.category) {
      const cat = req.query.category.toLowerCase();
      items = items.filter(p => (p.category || '').toLowerCase() === cat);
    }

    // search by name or description
    const search = (req.query.search || req.query.q || '').toString().trim().toLowerCase();
    if (search) {
      items = items.filter(p =>
        (p.name || '').toLowerCase().includes(search) ||
        (p.description || '').toLowerCase().includes(search)
      );
    }

    // pagination
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 10);
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = items.slice(start, start + limit);

    res.json({
      success: true,
      meta: { total, page, limit, totalPages },
      data
    });
  })
);

// GET /api/products/search?q=term
router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = (req.query.q || '').toString().trim().toLowerCase();
    if (!q) throw new ValidationError('Query param "q" is required for search');
    const items = getAllProducts().filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    );
    res.json({ success: true, query: q, count: items.length, data: items });
  })
);

// GET /api/products/stats
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const items = getAllProducts();
    const byCategory = items.reduce((acc, p) => {
      const cat = p.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    const inStock = items.filter(p => p.inStock).length;
    res.json({
      success: true,
      total: items.length,
      inStock,
      byCategory
    });
  })
);

// GET /api/products/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const product = findProductById(req.params.id);
    if (!product) throw new NotFoundError('Product not found');
    res.json({ success: true, data: product });
  })
);

// POST /api/products
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, description = '', price, category = 'Uncategorized', inStock = false } = req.body;
    const errors = [];
    if (!name || typeof name !== 'string') errors.push({ field: 'name', message: 'Name is required and must be a string' });
    if (typeof price !== 'number') errors.push({ field: 'price', message: 'Price is required and must be a number' });
    if (errors.length) throw new ValidationError('Invalid product payload', errors);

    const created = addProduct({ name, description, price, category, inStock });
    res.status(201).json({ success: true, data: created });
  })
);

// PUT /api/products/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const updated = updateProduct(req.params.id, req.body);
    if (!updated) throw new NotFoundError('Product not found');
    res.json({ success: true, data: updated });
  })
);

// DELETE /api/products/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const ok = deleteProduct(req.params.id);
    if (!ok) throw new NotFoundError('Product not found');
    res.json({ success: true, message: 'Product deleted' });
  })
);

module.exports = router;