// Generates public/sitemap.xml from the live API.
// Usage: npm run sitemap
import { writeFileSync } from 'node:fs';

const API = process.env.VITE_API_URL || 'https://admin.hogaacosmetics.com';
const SITE_URL = 'https://hogaacosmetics.com';
const today = new Date().toISOString().split('T')[0];

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/offers', changefreq: 'daily', priority: '0.8' },
  { path: '/store', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
];

const getJson = async (path) => {
  const res = await fetch(`${API}${path}`);
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  return res.json();
};

const escapeXml = (str) => String(str)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const [{ products }, { categories }, { pages }] = await Promise.all([
  getJson('/api/products?limit=10000'),
  getJson('/api/categories'),
  getJson('/api/pages/active'),
]);

const staticPaths = new Set(STATIC_PAGES.map(p => p.path));
const urls = [
  ...STATIC_PAGES,
  ...categories.filter(c => c.slug).map(c => ({ path: `/collections/${encodeURIComponent(c.slug)}`, changefreq: 'weekly', priority: '0.8' })),
  ...products.filter(p => p.slug).map(p => ({ path: `/product/${encodeURIComponent(p.slug)}`, changefreq: 'weekly', priority: '0.9' })),
  ...pages.filter(p => p.slug && !staticPaths.has(`/${p.slug}`)).map(p => ({ path: `/${encodeURIComponent(p.slug)}`, changefreq: 'monthly', priority: '0.5' })),
];

// Drop duplicates (same product listed once per variation, etc.)
const unique = [...new Map(urls.map(u => [u.path, u])).values()];

const xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
  + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
  + unique.map(u => `  <url>\n    <loc>${escapeXml(SITE_URL + u.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>\n`).join('')
  + '</urlset>\n';

writeFileSync(new URL('../public/sitemap.xml', import.meta.url), xml);
console.log(`sitemap.xml written with ${unique.length} URLs`);
