// backend/controllers/orderController.js
const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const User = require('../models/User'); // Need User model to clear cart
const Product = require('../models/Product'); // To update stock

// @desc    Create new order and process payment intent
// @route   POST /api/orders
// @access  Private (Maps to Information.html submission)
const addOrderItems = asyncHandler(async (req, res) => {
    const { 
        orderItems, 
        shippingAddress, 
        paymentMethod, 
        itemsPrice, 
        taxPrice, 
        shippingPrice, 
        totalPrice 
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    }

    // 1. Create Order in Database (Marked as NOT paid yet)
    const order = new Order({
        user: req.user._id,
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
    });

    const createdOrder = await order.save();
    
    // 2. Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(createdOrder.totalPrice * 100), // Stripe uses cents/lowest currency unit
        currency: 'usd', // Change this to your desired currency
        metadata: { integration_with: 'nativebites_eshop', order_id: createdOrder._id.toString() },
    });

    // 3. Respond with Order ID and Client Secret for Frontend Payment (Payment.html)
    res.status(201).json({
        orderId: createdOrder._id,
        clientSecret: paymentIntent.client_secret,
        message: 'Order created, proceed to payment.',
    });
});

// @desc    Get order by ID (Used for Ordertracking.html)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
        'user',
        'name email'
    ); // Populate user info

    if (order) {
        // Ensure the logged-in user owns the order, unless they are an admin
        if (order.user._id.toString() === req.user._id.toString() || req.user.isAdmin) {
            res.json(order);
        } else {
            res.status(403);
            throw new Error('Not authorized to view this order');
        }
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order to paid (After successful payment on Payment.html)
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    const { id, status, update_time, email_address } = req.body; // Payment details from Stripe webhook/confirmation

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = { 
            id: id,
            status: status,
            update_time: update_time,
            email_address: email_address,
        };

        const updatedOrder = await order.save();

        // **CRITICAL POST-PAYMENT ACTIONS:**
        
        // 1. Clear the user's cart
        const user = await User.findById(req.user._id);
        if (user) {
            user.cart = [];
            await user.save();
        }

        // 2. Update Product Stock (Simple version: decrement stock for all items)
        for (const item of updatedOrder.orderItems) {
            const product = await Product.findById(item.product);
            if (product) {
                product.countInStock -= item.qty;
                await product.save();
            }
        }
        
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Get logged-in user's orders (Used for Orderpage.html)
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
});

module.exports = {
    addOrderItems,
    getOrderById,
    updateOrderToPaid,
    getMyOrders
};