// routes/productRoutes.js (ES Module - Mock Data)

import express from 'express';
const router = express.Router();

// Mock Data (replaces database calls)
const MOCK_PRODUCTS = [
    { id: 'p1', name: 'Burger Deluxe', price: 12.99, category: 'Main' },
    { id: 'p2', name: 'Fries', price: 3.50, category: 'Side' }
];

// GET /api/products
router.get('/', (req, res) => {
    res.json({ message: 'Retrieved all products (mock data)', data: MOCK_PRODUCTS });
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
    const product = MOCK_PRODUCTS.find(p => p.id === req.params.id);
    if (product) {
        res.json({ message: `Retrieved product ID: ${req.params.id}`, data: product });
    } else {
        res.status(404).json({ message: 'Product not found' });
    }
});

// POST /api/products
router.post('/', (req, res) => {
    res.status(201).json({ 
        message: 'Product created successfully (mock)', 
        data: { id: Date.now().toString(), ...req.body } 
    });
});

export default router;