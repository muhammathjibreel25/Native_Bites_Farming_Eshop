// routes/orderRoutes.js (ES Module - Mock Data)

import express from 'express';
const router = express.Router();

// Mock Data (replaces database calls)
const MOCK_ORDERS = [
    { id: 'o1', userId: '1', total: 16.49, status: 'Delivered' },
    { id: 'o2', userId: '2', total: 25.00, status: 'Pending' }
];

// GET /api/orders
router.get('/', (req, res) => {
    res.json({ message: 'Retrieved all orders (mock data)', data: MOCK_ORDERS });
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
    const order = MOCK_ORDERS.find(o => o.id === req.params.id);
    if (order) {
        res.json({ message: `Retrieved order ID: ${req.params.id}`, data: order });
    } else {
        res.status(404).json({ message: 'Order not found' });
    }
});

// POST /api/orders
router.post('/', (req, res) => {
    res.status(201).json({ 
        message: 'Order created successfully (mock)', 
        data: { id: Date.now().toString(), ...req.body } 
    });
});

export default router;