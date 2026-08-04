// utils/payuHelper.js
const crypto = require('crypto');
const payuConfig = require('../config/payu');

class PayUHelper {
    // Generate hash for payment request (PayU Standard)
    static generateHash(data) {
        const config = payuConfig.getConfig();
        
        // PayU Standard Hash Formula (Exactly as per PayU documentation):
        // sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
        // Note: There are 6 pipe symbols (||||||) before SALT
        
        const hashString = `${config.key}|${data.txnid}|${data.amount}|${data.productinfo}|${data.firstname}|${data.email}|${data.udf1}|${data.udf2}|${data.udf3}|${data.udf4}|${data.udf5}||||||${config.salt}`;
        
        console.log('========== HASH GENERATION ==========');
        console.log('Key:', config.key);
        console.log('TxnID:', data.txnid);
        console.log('Amount:', data.amount);
        console.log('Product Info:', data.productinfo);
        console.log('First Name:', data.firstname);
        console.log('Email:', data.email);
        console.log('UDF1:', data.udf1);
        console.log('UDF2:', data.udf2);
        console.log('UDF3:', data.udf3);
        console.log('UDF4:', data.udf4);
        console.log('UDF5:', data.udf5);
        console.log('Salt:', config.salt);
        console.log('Hash String:', hashString);
        
        const hash = crypto.createHash('sha512').update(hashString).digest('hex');
        console.log('Generated Hash:', hash);
        console.log('=====================================');
        
        return hash;
    }
    
    // Verify hash from PayU response
    static verifyHash(data) {
        const config = payuConfig.getConfig();
        
        // PayU Response Hash Formula:
        // sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
        
        const hashString = `${config.salt}|${data.status}||||||${data.udf5 || ''}|${data.udf4 || ''}|${data.udf3 || ''}|${data.udf2 || ''}|${data.udf1 || ''}|${data.email || ''}|${data.firstname || ''}|${data.productinfo || ''}|${data.amount || ''}|${data.txnid || ''}|${data.key || ''}`;
        
        console.log('========== HASH VERIFICATION ==========');
        console.log('Hash String:', hashString);
        
        const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
        console.log('Calculated Hash:', calculatedHash);
        console.log('Received Hash:', data.hash);
        console.log('=======================================');
        
        return calculatedHash === data.hash;
    }
    
    // Generate transaction ID (max 20 characters)
    static generateTxnId() {
        const timestamp = Date.now().toString();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        let txnid = `TXN${timestamp}${random}`;
        // PayU limits txnid to 20 characters
        if (txnid.length > 20) {
            txnid = txnid.substring(0, 20);
        }
        return txnid;
    }
    
    // Prepare payment data
    static preparePaymentData(order, user, amount) {
        const config = payuConfig.getConfig();
        const txnid = this.generateTxnId();
        
        // Clean user data
        const firstname = (user.name || 'Customer').replace(/[^a-zA-Z ]/g, '').trim().substring(0, 50);
        const email = (user.email || 'customer@example.com').trim().substring(0, 50);
        const phone = (user.mobile || '9999999999').replace(/\D/g, '').substring(0, 10);
        
        // Product info max 100 characters
        let productinfo = `Order #${order.order_number}`;
        if (productinfo.length > 100) {
            productinfo = productinfo.substring(0, 100);
        }
        
        // Amount should be in proper format
        const formattedAmount = parseFloat(amount).toFixed(2);
        
        const paymentData = {
            key: config.key,
            txnid: txnid,
            amount: formattedAmount,
            productinfo: productinfo,
            firstname: firstname,
            email: email,
            phone: phone,
            surl: config.successUrl,
            furl: config.failureUrl,
            curl: config.cancelUrl,
            udf1: order.id.toString(),
            udf2: user.id.toString(),
            udf3: order.order_number,
            udf4: '',
            udf5: ''
        };
        
        // Generate hash
        paymentData.hash = this.generateHash(paymentData);
        
        return paymentData;
    }
}

module.exports = PayUHelper;