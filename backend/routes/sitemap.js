const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Page = require('../models/Page');

const SITE_URL = (process.env.FRONTEND_URL || 'https://hogaacosmetics.com').replace(/\/$/, '');

// Public storefront pages (login/cart/checkout/payment etc. are intentionally excluded)
const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/offers', changefreq: 'daily', priority: '0.8' },
  { path: '/store', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' }
];

const escapeXml = (str) => String(str)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const urlEntry = ({ path, lastmod, changefreq, priority }) => {
  let xml = `  <url>\n    <loc>${escapeXml(SITE_URL + path)}</loc>\n`;
  if (lastmod) xml += `    <lastmod>${new Date(lastmod).toISOString().split('T')[0]}</lastmod>\n`;
  if (changefreq) xml += `    <changefreq>${changefreq}</changefreq>\n`;
  if (priority) xml += `    <priority>${priority}</priority>\n`;
  return xml + '  </url>\n';
};

// GET /sitemap.xml
router.get('/sitemap.xml', async (req, res) => {
  try {
    const [categories, products, pages] = await Promise.all([
      Category.findAll({
        where: { status: 'active', slug: { [Op.ne]: null } },
        attributes: ['slug', 'updated_at']
      }),
      Product.findAll({
        where: { is_active: true, slug: { [Op.ne]: null } },
        attributes: ['slug', 'updated_at']
      }),
      Page.findAll({
        where: { status: 'active' },
        attributes: ['slug', 'updated_at']
      })
    ]);

    const staticPaths = new Set(STATIC_PAGES.map(p => p.path));
    const urls = [
      ...STATIC_PAGES,
      ...categories.map(c => ({
        path: `/collections/${encodeURIComponent(c.slug)}`,
        lastmod: c.updated_at,
        changefreq: 'weekly',
        priority: '0.8'
      })),
      ...products.map(p => ({
        path: `/product/${encodeURIComponent(p.slug)}`,
        lastmod: p.updated_at,
        changefreq: 'weekly',
        priority: '0.9'
      })),
      ...pages
        .filter(p => !staticPaths.has(`/${p.slug}`))
        .map(p => ({
          path: `/${encodeURIComponent(p.slug)}`,
          lastmod: p.updated_at,
          changefreq: 'monthly',
          priority: '0.5'
        }))
    ];

    const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
      + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + urls.map(urlEntry).join('')
      + '</urlset>\n';

    res.set('Content-Type', 'application/xml');
    res.set('Cache-Control', 'public, max-age=3600');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap error:', error);
    res.status(500).set('Content-Type', 'text/plain').send('Failed to generate sitemap');
  }
});

module.exports = router;
