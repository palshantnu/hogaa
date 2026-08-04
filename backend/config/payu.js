// config/payu.js
module.exports = {
    // Test Mode (Sandbox)
    testMode: true,
    
    // PayU Test Credentials
    test: {
        key: 'tfCCWS',
        salt: 'enZrSDsf4Oc2km1hIzdBSheFT1pCplMT',
        url: 'https://test.payu.in/_payment',
        successUrl: 'http://localhost:5050/api/payment/payu-success',
        failureUrl: 'http://localhost:5050/api/payment/payu-failure',
        cancelUrl: 'http://localhost:5050/api/payment/payu-cancel'
    },
    
    // Production Credentials (Replace with your actual credentials)
    production: {
        key: 'YOUR_PRODUCTION_KEY',
        salt: 'YOUR_PRODUCTION_SALT',
        url: 'https://secure.payu.in/_payment',
        successUrl: 'https://yourdomain.com/api/payment/payu-success',
        failureUrl: 'https://yourdomain.com/api/payment/payu-failure',
        cancelUrl: 'https://yourdomain.com/api/payment/payu-cancel'
    },
    
    // Get current config
    getConfig: function() {
        return this.testMode ? this.test : this.production;
    }
};