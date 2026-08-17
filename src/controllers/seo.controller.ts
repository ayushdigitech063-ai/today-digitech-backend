import { Request, Response, NextFunction } from 'express';
import { SeoMeta } from '../models/SeoMeta';
import { Service } from '../models/Service';
import { Industry } from '../models/Industry';
import { Location } from '../models/Location';
import { BlogPost } from '../models/BlogPost';
import { Page } from '../models/Page';
import { CaseStudy } from '../models/CaseStudy';
import { sendSuccess } from '../utils/apiResponse';

const BASE_URL = process.env.SITE_URL || 'https://todaydigitech.com';

export const getPublicSeoByPath = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pagePath = req.params[0] || '/';
    const seo = await SeoMeta.findOne({ pagePath, isActive: true });
    sendSuccess(res, seo || null, 'SEO metadata fetched');
  } catch (error) {
    next(error);
  }
};

export const getDynamicSitemap = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [pages, services, industries, locations, blogPosts, caseStudies] = await Promise.all([
      Page.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
      Service.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
      Industry.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
      Location.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
      BlogPost.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
      CaseStudy.find({ status: 'Published', isActive: true }).select('slug updatedAt'),
    ]);

    const staticPaths = [
      { path: '/', priority: '1.0', changefreq: 'weekly' },
      { path: '/about', priority: '0.8', changefreq: 'monthly' },
      { path: '/services', priority: '0.9', changefreq: 'weekly' },
      { path: '/industries', priority: '0.8', changefreq: 'monthly' },
      { path: '/locations', priority: '0.8', changefreq: 'monthly' },
      { path: '/blog', priority: '0.9', changefreq: 'daily' },
      { path: '/case-studies', priority: '0.8', changefreq: 'weekly' },
      { path: '/packages', priority: '0.7', changefreq: 'monthly' },
      { path: '/careers', priority: '0.7', changefreq: 'weekly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' },
      { path: '/faqs', priority: '0.6', changefreq: 'monthly' },
      { path: '/success-stories', priority: '0.7', changefreq: 'monthly' },
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    for (const sp of staticPaths) {
      xml += `  <url>\n    <loc>${BASE_URL}${sp.path}</loc>\n    <changefreq>${sp.changefreq}</changefreq>\n    <priority>${sp.priority}</priority>\n  </url>\n`;
    }

    const addDynamic = (items: Array<{ slug: string; updatedAt?: Date }>, prefix: string, priority: string, changefreq: string) => {
      for (const item of items) {
        const lastmod = item.updatedAt ? `\n    <lastmod>${item.updatedAt.toISOString().split('T')[0]}</lastmod>` : '';
        xml += `  <url>\n    <loc>${BASE_URL}${prefix}/${item.slug}</loc>${lastmod}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>\n`;
      }
    };

    addDynamic(services, '/services', '0.8', 'weekly');
    addDynamic(industries, '/industries', '0.7', 'monthly');
    addDynamic(locations, '/locations', '0.7', 'monthly');
    addDynamic(blogPosts, '/blog', '0.8', 'weekly');
    addDynamic(caseStudies, '/case-studies', '0.7', 'monthly');

    xml += '</urlset>';

    res.setHeader('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    next(error);
  }
};

export const getDynamicRobots = async (_req: Request, res: Response): Promise<void> => {
  const noindexPaths = await SeoMeta.find({ indexPage: false, isActive: true }).select('pagePath');
  let robots = 'User-agent: *\nAllow: /\n';
  for (const item of noindexPaths) {
    robots += `Disallow: ${item.pagePath}\n`;
  }
  robots += `\nSitemap: ${BASE_URL}/api/v1/public/sitemap\n`;
  res.setHeader('Content-Type', 'text/plain');
  res.send(robots);
};
