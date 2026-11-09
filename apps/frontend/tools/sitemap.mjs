function sitemapUrl(siteUrl, { path, lastModified }) {
  const lastModifiedTag = lastModified ? `\n    <lastmod>${lastModified}</lastmod>` : '';
  return `  <url>\n    <loc>${siteUrl}${path}</loc>${lastModifiedTag}\n  </url>`;
}

export function renderSitemap(siteUrl, entries) {
  const urls = entries.map((entry) => sitemapUrl(siteUrl, entry)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}
