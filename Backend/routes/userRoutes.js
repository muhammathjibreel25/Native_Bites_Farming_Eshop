// routes/userRoutes.js (ES Module - Mock Data)

import express from 'express';
const router = express.Router();

// Mock Data (replaces database calls)
const MOCK_USERS = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
];

// GET /api/users
router.get('/', (req, res) => {
    res.json({ message: 'Retrieved all users (mock data)', data: MOCK_USERS });
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
    const user = MOCK_USERS.find(u => u.id === req.params.id);
    if (user) {
        res.json({ message: `Retrieved user ID: ${req.params.id}`, data: user });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// POST /api/users
router.post('/', (req, res) => {
    // In a real app, you would validate and save req.body
    res.status(201).json({ 
        message: 'User created successfully (mock)', 
        data: { id: Date.now().toString(), ...req.body } 
    });
});

export default router;