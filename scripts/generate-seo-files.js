import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import yaml from 'js-yaml';

const root = process.cwd();
const publicDir = path.join(root, 'public');
dotenv.config({ path: path.join(root, '.env.local') });
dotenv.config({ path: path.join(root, '.env') });

const siteUrl = (
  process.env.VITE_WEBSITE_URL || 'https://betteraparri.org'
).replace(/\/+$/, '');

function readYaml(filePath) {
  return yaml.load(fs.readFileSync(filePath, 'utf8'));
}

function listMarkdownRoutes(section, category) {
  const dir = path.join(root, 'content', section, category);

  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter(file => file.endsWith('.md') && file !== 'index.md')
    .map(file => `/${section}/${category}/${file.replace(/\.md$/, '')}`);
}

function indexRoutes(section) {
  const indexPath = path.join(root, 'content', section, 'index.yaml');

  if (!fs.existsSync(indexPath)) {
    return [];
  }

  const index = readYaml(indexPath);
  const pages = index.pages ?? [];

  return [`/${section}`, ...pages.map(page => `/${section}/${page.slug}`)];
}

function serviceRoutes() {
  const services = readYaml(path.join(root, 'src', 'data', 'services.yaml'));

  return [
    '/services',
    ...services.categories.flatMap(category => [
      `/services/${category.slug}`,
      ...listMarkdownRoutes('services', category.slug),
    ]),
  ];
}

function governmentRoutes() {
  const government = readYaml(
    path.join(root, 'src', 'data', 'government.yaml')
  );

  return [
    '/government',
    ...government.categories.flatMap(category => [
      `/government/${category.slug}`,
      ...listMarkdownRoutes('government', category.slug),
    ]),
  ];
}

const routes = [
  '/',
  '/updates',
  ...serviceRoutes(),
  ...governmentRoutes(),
  ...indexRoutes('transparency'),
  ...indexRoutes('statistics'),
];

const uniqueRoutes = [...new Set(routes)].sort((a, b) => a.localeCompare(b));
const now = new Date().toISOString().slice(0, 10);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueRoutes
  .map(
    route => `  <url>
    <loc>${siteUrl}${route}</loc>
    <lastmod>${now}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
fs.writeFileSync(path.join(publicDir, 'robots.txt'), robots);

console.log(`Generated ${uniqueRoutes.length} sitemap URLs for ${siteUrl}`);
