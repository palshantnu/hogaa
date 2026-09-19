const { getShippingSettings } = require('./shipping');

// Store-wide GST rate applied to every product/variation - not entered per product.
const TOTAL_GST_RATE = 18;

// A product/variation stores this total GST rate as cgst_rate = sgst_rate = total/2
// and igst_rate = total (see adminController addProduct/updateProduct). Which pair
// actually applies is decided per-order from the shipping state, not at product save time.

function statesMatch(homeState, customerState) {
    const home = (homeState || '').trim().toLowerCase();
    const customer = (customerState || '').trim().toLowerCase();
    return !!home && home === customer;
}

async function isSameStateAsBusiness(customerState) {
    const settings = await getShippingSettings();
    return statesMatch(settings.homeState, customerState);
}

// Splits a single GST% into the stored cgst/sgst/igst rate triple.
function splitGstRate(totalGstRate) {
    const total = parseFloat(totalGstRate) || 0;
    return { cgst_rate: total / 2, sgst_rate: total / 2, igst_rate: total };
}

// Applies the stored rate triple to an item total, picking CGST+SGST (same state)
// or IGST (other state) so the tax isn't counted twice.
function calculateGstAmounts(itemTotal, rates, sameState) {
    if (sameState) {
        return {
            cgstAmount: (itemTotal * (parseFloat(rates.cgst_rate) || 0)) / 100,
            sgstAmount: (itemTotal * (parseFloat(rates.sgst_rate) || 0)) / 100,
            igstAmount: 0
        };
    }
    return {
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: (itemTotal * (parseFloat(rates.igst_rate) || 0)) / 100
    };
}

module.exports = { TOTAL_GST_RATE, isSameStateAsBusiness, statesMatch, splitGstRate, calculateGstAmounts };
