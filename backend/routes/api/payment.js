// routes/api/payment.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { Order, User, OrderItem, Product, ProductVariation } = require('../../models');
const payuConfig = require('../../config/payu');
const PayUHelper = require('../../utils/payuHelper');

// Initiate payment
// In routes/api/payment.js, update the initiate route

router.post('/initiate', async (req, res) => {
    try {
        const { order_id, user_id, amount } = req.body;
        
        console.log('========== PAYMENT INITIATION ==========');
        console.log('Order ID:', order_id);
        console.log('User ID:', user_id);
        console.log('Amount:', amount);
        
        const order = await Order.findByPk(order_id);
        const user = await User.findByPk(user_id);
        
        if (!order || !user) {
            console.log('Order or User not found');
            return res.status(404).json({ success: false, message: 'Order or user not found' });
        }
        
        const paymentData = PayUHelper.preparePaymentData(order, user, amount);
        const config = payuConfig.getConfig();
        
        console.log('Payment URL:', config.url);
        console.log('Payment Data:', {
            key: paymentData.key,
            txnid: paymentData.txnid,
            amount: paymentData.amount,
            productinfo: paymentData.productinfo,
            firstname: paymentData.firstname,
            email: paymentData.email,
            hash: paymentData.hash.substring(0, 20) + '...'
        });
        console.log('========================================');
        
        res.json({
            success: true,
            paymentData: paymentData,
            payuUrl: config.url
        });
        
    } catch (error) {
        console.error('Payment initiation error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// Payment success callback
router.post('/payu-success', async (req, res) => {
    try {
        const response = req.body;
        
        // Verify hash
        if (!PayUHelper.verifyHash(response)) {
            console.error('Invalid hash received');
            return res.redirect('/payment-failed?error=invalid_hash');
        }
        
        // Update order status
        const orderId = parseInt(response.udf1);
        const userId = parseInt(response.udf2);
        const txnid = response.txnid;
        
        await Order.update(
            {
                payment_status: 'paid',
                order_status: 'confirmed',
                tracking_number: txnid
            },
            { where: { id: orderId } }
        );
        
        // Clear cart after successful payment
        const { Cart, CartItem } = require('../../models');
        const cart = await Cart.findOne({ where: { user_id: userId } });
        if (cart) {
            await CartItem.destroy({ where: { cart_id: cart.id } });
            await cart.update({ total_items: 0, subtotal: 0, total: 0 });
        }
        
        // Redirect to success page
        res.redirect(`https://hogaacosmetics.com/payment-success?order_id=${orderId}&txnid=${txnid}`);
        
    } catch (error) {
        console.error('Payment success error:', error);
        res.redirect('https://hogaacosmetics.com/payment-failed?error=server_error');
    }
});

// Payment failure callback
router.post('/payu-failure', async (req, res) => {
    try {
        const response = req.body;
        const orderId = parseInt(response.udf1);
        
        await Order.update(
            {
                payment_status: 'failed',
                order_status: 'pending'
            },
            { where: { id: orderId } }
        );
        
        res.redirect(`https://hogaacosmetics.com/payment-failed?error=${response.status}`);
        
    } catch (error) {
        console.error('Payment failure error:', error);
        res.redirect('https://hogaacosmetics.com/payment-failed?error=server_error');
    }
});

// Payment cancel callback
router.post('/payu-cancel', async (req, res) => {
    try {
        const response = req.body;
        const orderId = parseInt(response.udf1);
        
        await Order.update(
            {
                payment_status: 'pending',
                order_status: 'pending'
            },
            { where: { id: orderId } }
        );
        
        res.redirect(`https://hogaacosmetics.com/payment-cancelled?order_id=${orderId}`);
        
    } catch (error) {
        console.error('Payment cancel error:', error);
        res.redirect('https://hogaacosmetics.com/payment-failed?error=cancelled');
    }
});

// Check payment status
router.get('/status/:order_id', async (req, res) => {
    try {
        const { order_id } = req.params;
        const order = await Order.findByPk(order_id, {
            attributes: ['payment_status', 'order_status', 'order_number']
        });
        
        res.json({
            success: true,
            payment_status: order.payment_status,
            order_status: order.order_status,
            order_number: order.order_number
        });
        
    } catch (error) {
        console.error('Payment status error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;