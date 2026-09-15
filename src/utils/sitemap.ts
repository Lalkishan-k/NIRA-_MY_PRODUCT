import fs from 'fs';
import path from 'path';
import { initialProducts } from '../data/sampleProducts.ts';
import { Product } from '../types.ts';

export interface SitemapUrlEntry {
  loc: string;
  lastmod?: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
  images?: Array<{
    loc: string;
    title?: string;
    caption?: string;
  }>;
}

export interface SitemapOptions {
  siteUrl?: string;
  products?: Product[];
}

export const CANONICAL_SITE_URL = process.env.SITE_URL || 'https://nira.farm';

/**
 * Builds the complete list of URLs for NIRA e-commerce store
 */
export function getSitemapEntries(options?: SitemapOptions): SitemapUrlEntry[] {
  const siteUrl = (options?.siteUrl || CANONICAL_SITE_URL).replace(/\/+$/, '');
  const productList = options?.products && options.products.length > 0 ? options.products : initialProducts;
  const now = new Date().toISOString().split('T')[0];

  const entries: SitemapUrlEntry[] = [
    // 1. Core / Landing Pages
    {
      loc: `${siteUrl}/`,
      lastmod: now,
      changefreq: 'daily',
      priority: 1.0,
      images: [
        {
          loc: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80',
          title: 'NIRA 100% Pure Raw Kerala Coconut Oil',
          caption: 'Authentic unfiltered cold expeller pressed Kerala coconut oil'
        }
      ]
    },
    {
      loc: `${siteUrl}/shop`,
      lastmod: now,
      changefreq: 'daily',
      priority: 0.95
    },

    // 2. Individual Product Detail Pages (High indexing priority with image metadata)
    ...productList.filter(p => p.active !== false).map(product => {
      const productImages = (product.images || []).map(img => ({
        loc: img.startsWith('http') ? img : `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`,
        title: product.name,
        caption: product.shortDescription || product.description
      }));

      return {
        loc: `${siteUrl}/product/${product.slug}`,
        lastmod: product.updatedAt ? product.updatedAt.split('T')[0] : now,
        changefreq: 'weekly' as const,
        priority: 0.9,
        images: productImages.length > 0 ? productImages : undefined
      };
    }),

    // 3. Customer Engagement & Support Pages
    {
      loc: `${siteUrl}/track-order`,
      lastmod: now,
      changefreq: 'weekly',
      priority: 0.8
    },
    {
      loc: `${siteUrl}/contact`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.75
    },
    {
      loc: `${siteUrl}/account`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.6
    },

    // 4. Policy & Trust Pages (Crucial for SEO, Google Merchant, and consumer compliance)
    {
      loc: `${siteUrl}/shipping-policy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${siteUrl}/return-refund-policy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${siteUrl}/privacy-policy`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7
    },
    {
      loc: `${siteUrl}/terms-conditions`,
      lastmod: now,
      changefreq: 'monthly',
      priority: 0.7
    }
  ];

  return entries;
}

/**
 * Escapes special XML characters
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

/**
 * Generates XML string adhering to the sitemap 0.9 protocol and Google Image Sitemap extension
 */
export function generateSitemapXml(options?: SitemapOptions): string {
  const entries = getSitemapEntries(options);

  const xmlItems = entries.map(entry => {
    let item = '  <url>\n';
    item += `    <loc>${escapeXml(entry.loc)}</loc>\n`;
    if (entry.lastmod) {
      item += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      item += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      item += `    <priority>${entry.priority.toFixed(2)}</priority>\n`;
    }

    if (entry.images && entry.images.length > 0) {
      for (const img of entry.images) {
        if (!img.loc) continue;
        item += '    <image:image>\n';
        item += `      <image:loc>${escapeXml(img.loc)}</image:loc>\n`;
        if (img.title) {
          item += `      <image:title>${escapeXml(img.title)}</image:title>\n`;
        }
        if (img.caption) {
          item += `      <image:caption>${escapeXml(img.caption)}</image:caption>\n`;
        }
        item += '    </image:image>\n';
      }
    }

    item += '  </url>';
    return item;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlItems}
</urlset>`;
}

/**
 * Generates standard robots.txt referencing the sitemap
 */
export function generateRobotsTxt(options?: SitemapOptions): string {
  const siteUrl = (options?.siteUrl || CANONICAL_SITE_URL).replace(/\/+$/, '');

  return `# Robots.txt for NIRA Pure Coconut Oil
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /api/*
Disallow: /checkout
Disallow: /order-confirmation/*

# Host & Sitemap location
Sitemap: ${siteUrl}/sitemap.xml
`;
}

/**
 * Build-time file generation utility
 */
export async function buildAndSaveSitemap(options?: {
  targetDirs?: string[];
  siteUrl?: string;
  products?: Product[];
}): Promise<{ totalUrls: number; writtenFiles: string[] }> {
  const targetDirs = options?.targetDirs || [
    path.join(process.cwd(), 'public'),
    path.join(process.cwd(), 'dist')
  ];

  const xmlContent = generateSitemapXml(options);
  const robotsContent = generateRobotsTxt(options);
  const entries = getSitemapEntries(options);
  const writtenFiles: string[] = [];

  for (const dir of targetDirs) {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const sitemapPath = path.join(dir, 'sitemap.xml');
      const robotsPath = path.join(dir, 'robots.txt');

      fs.writeFileSync(sitemapPath, xmlContent, 'utf-8');
      fs.writeFileSync(robotsPath, robotsContent, 'utf-8');

      writtenFiles.push(sitemapPath, robotsPath);
    } catch (err) {
      console.warn(`[Sitemap] Warning: Could not write to ${dir}:`, err);
    }
  }

  return {
    totalUrls: entries.length,
    writtenFiles
  };
}
