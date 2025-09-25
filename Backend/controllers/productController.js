// backend/controllers/productController.js
const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Fetch all products, optionally filtered by category
// @route   GET /api/products?category=...
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    // Check for a category query parameter (e.g., /api/products?category=Eggs)
    const category = req.query.category; 

    const query = category ? { category: category } : {};

    // Find products matching the query (all or by category)
    const products = await Product.find(query);
    
    // The frontend can now use this JSON data to populate Shop.html or Category.html
    res.json(products);
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        // The frontend can use this to populate Product.html
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById
};