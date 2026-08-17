import { Router } from 'express';
import { getPublicSettings } from '../../controllers/setting.controller';
import { getPublicNavigation } from '../../controllers/navigation.controller';
import { submitPublicLead } from '../../controllers/lead.controller';
import { getPublicJobs, getPublicJobBySlug, submitApplication } from '../../controllers/career.controller';
import { getPublicSeoByPath, getDynamicSitemap, getDynamicRobots } from '../../controllers/seo.controller';
import { getPublicAnalyticsScripts } from '../../controllers/analytics.controller';
import { upload } from '../../middlewares/upload.middleware';
import {
  getPublicHomepage,
  getPublicServices,
  getPublicServiceBySlug,
  getPublicServiceCategories,
  getPublicPages,
  getPublicPageBySlug,
  getPublicIndustries,
  getPublicIndustryBySlug,
  getPublicLocations,
  getPublicLocationBySlug,
  getPublicPackages,
  getPublicTestimonials,
  getPublicFaqs,
  getPublicCaseStudies,
  getPublicCaseStudyBySlug,
  getPublicPortfolio,
  getPublicPortfolioBySlug,
  getPublicBlog,
  getPublicBlogBySlug,
  getPublicBlogCategories,
  getPublicBlogTags,
  getPublicBlogAuthors,
  getPublicClients,
  getPublicTeam,
} from '../../controllers/publicCms.controller';

const router = Router();

// Platform System Endpoints
router.get('/settings', getPublicSettings);
router.get('/navigation', getPublicNavigation);
router.post('/leads', submitPublicLead);
router.get('/careers', getPublicJobs);
router.get('/careers/:slug', getPublicJobBySlug);
router.post('/careers/apply', upload.single('resume'), submitApplication);
router.get('/sitemap', getDynamicSitemap);
router.get('/robots', getDynamicRobots);
router.get('/analytics/scripts', getPublicAnalyticsScripts);
router.get('/seo/*', getPublicSeoByPath);

// Published-Content Public CMS Endpoints
router.get('/homepage', getPublicHomepage);
router.get('/pages', getPublicPages);
router.get('/pages/:slug', getPublicPageBySlug);
router.get('/services', getPublicServices);
router.get('/services/:slug', getPublicServiceBySlug);
router.get('/service-categories', getPublicServiceCategories);
router.get('/industries', getPublicIndustries);
router.get('/industries/:slug', getPublicIndustryBySlug);
router.get('/locations', getPublicLocations);
router.get('/locations/:slug', getPublicLocationBySlug);
router.get('/packages', getPublicPackages);
router.get('/testimonials', getPublicTestimonials);
router.get('/faqs', getPublicFaqs);
router.get('/case-studies', getPublicCaseStudies);
router.get('/case-studies/:slug', getPublicCaseStudyBySlug);
router.get('/portfolio', getPublicPortfolio);
router.get('/portfolio/:slug', getPublicPortfolioBySlug);
router.get('/blog', getPublicBlog);
router.get('/blog/:slug', getPublicBlogBySlug);
router.get('/blog-categories', getPublicBlogCategories);
router.get('/blog-tags', getPublicBlogTags);
router.get('/blog-authors', getPublicBlogAuthors);
router.get('/clients', getPublicClients);
router.get('/team', getPublicTeam);

export default router;
