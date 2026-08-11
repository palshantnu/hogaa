// config/payu.js
module.exports = {
    // Live Mode - checkout now goes through real PayU, real money moves.
    testMode: false,

    // PayU Test Credentials
    test: {
        key: 'tfCCWS',
        salt: 'enZrSDsf4Oc2km1hIzdBSheFT1pCplMT',
        url: 'https://test.payu.in/_payment',
        successUrl: 'http://localhost:5050/api/payment/payu-success',
        failureUrl: 'http://localhost:5050/api/payment/payu-failure',
        cancelUrl: 'http://localhost:5050/api/payment/payu-cancel'
    },

    // Production Credentials
    production: {
        key: 'ZOdzk1',
        salt: 'PsAHpV0j0ytoRAlgjq1gAVz77TVpIxWA',
        url: 'https://secure.payu.in/_payment',
        successUrl: 'https://admin.hogaacosmetics.com/api/payment/payu-success',
        failureUrl: 'https://admin.hogaacosmetics.com/api/payment/payu-failure',
        cancelUrl: 'https://admin.hogaacosmetics.com/api/payment/payu-cancel'
    },
    
    // Get current config
    getConfig: function() {
        return this.testMode ? this.test : this.production;
    }
};