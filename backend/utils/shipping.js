const SiteSetting = require('../models/SiteSetting');

const SHIPPING_SETTING_KEY = 'shipping_charge';

// Defaults used until an admin configures this from /admin/settings.
const DEFAULT_SHIPPING_CHARGE = {
    homeState: 'Maharashtra',
    sameStateCharge: 40,
    otherStateCharge: 70
};

async function getShippingSettings() {
    const setting = await SiteSetting.findOne({ where: { key: SHIPPING_SETTING_KEY } });
    if (setting && setting.value) {
        return { ...DEFAULT_SHIPPING_CHARGE, ...JSON.parse(setting.value) };
    }
    return { ...DEFAULT_SHIPPING_CHARGE };
}

// Same-state vs other-state charge, detected from the state the customer filled in at checkout.
function resolveShippingCharge(state, settings) {
    const homeState = (settings.homeState || '').trim().toLowerCase();
    const customerState = (state || '').trim().toLowerCase();
    const isSameState = !!homeState && homeState === customerState;
    const charge = isSameState ? settings.sameStateCharge : settings.otherStateCharge;
    return parseFloat(charge) || 0;
}

async function calculateShippingCharge(state) {
    const settings = await getShippingSettings();
    return resolveShippingCharge(state, settings);
}

module.exports = {
    DEFAULT_SHIPPING_CHARGE,
    SHIPPING_SETTING_KEY,
    getShippingSettings,
    resolveShippingCharge,
    calculateShippingCharge
};
