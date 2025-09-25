// backend/controllers/cartController.js
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// --- Helper function to retrieve and format cart ---
const getFormattedCart = async (userId) => {
    // Populate the 'product' field in the cart array with full product details
    const user = await User.findById(userId).populate('cart.product');
    if (!user) {
        throw new Error('User not found');
    }
    return user.cart;
};

// @desc    Get user's cart contents
// @route   GET /api/cart
// @access  Private (Requires protection middleware)
const getCart = asyncHandler(async (req, res) => {
    // req.user is available because of the 'protect' middleware
    const cart = await getFormattedCart(req.user._id);
    res.json(cart);
});

// @desc    Add a product to the cart or update quantity
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user) {
        const itemIndex = user.cart.findIndex(item => 
            item.product.toString() === productId
        );

        if (itemIndex > -1) {
            // Product exists, update quantity
            user.cart[itemIndex].quantity = quantity; // Overwrite or add, depending on frontend logic
        } else {
            // New product, add to cart
            user.cart.push({ product: productId, quantity: quantity });
        }

        await user.save();
        const cart = await getFormattedCart(userId);
        res.status(200).json(cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update quantity of an item in the cart
// @route   PUT /api/cart
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user) {
        const itemIndex = user.cart.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            await user.save();
            const cart = await getFormattedCart(userId);
            res.status(200).json(cart);
        } else {
            res.status(404);
            throw new Error('Product not found in cart');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Remove an item from the cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
    const productId = req.params.id; // Product ID to remove
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user) {
        // Filter out the item with the matching product ID
        user.cart = user.cart.filter(item => item.product.toString() !== productId);
        
        await user.save();
        const cart = await getFormattedCart(userId);
        res.status(200).json(cart);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Clear the entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (user) {
        user.cart = []; // Empty the cart array
        await user.save();
        res.status(200).json({ message: 'Cart cleared successfully', cart: [] });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = {
    getCart,
    addToCart,
    updateCart,
    removeFromCart,
    clearCart
};