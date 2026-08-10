// Default content for the homepage "Shop smarter with hogaa" promo section.
// Mirrors what was previously hardcoded in frontend/src/Components/AppPromotion.jsx,
// so nothing changes visually until an admin actually edits it from /admin/settings.
// Image fields are left null - the frontend keeps its own bundled fallback images
// until an admin uploads a replacement.
const DEFAULT_APP_PROMO = {
    badge: '✨ LIMITED TIME OFFER',
    title: 'Shop smarter with',
    titleHighlight: 'hogaa',
    description: 'Experience beauty at your fingertips. Get exclusive early access to new launches, personalized makeup recommendations, and app-only discounts. Your perfect look is just a tap away.',
    features: [
        { icon: '🚀', label: 'Early Access' },
        { icon: '💎', label: 'Exclusive Discounts' },
        { icon: '🎁', label: 'Free Gifts' }
    ],
    ctaPrimary: { text: 'Shop Now →', link: '/collections/lips' },
    ctaSecondary: { text: 'Explore Collections', link: '/collections/face' },
    images: { tall: null, stack1: null, stack2: null }
};

module.exports = { DEFAULT_APP_PROMO };
