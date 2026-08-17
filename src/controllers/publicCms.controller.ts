import { Request, Response, NextFunction } from 'express';
import { Page } from '../models/Page';
import { Service } from '../models/Service';
import { ServiceCategory } from '../models/ServiceCategory';
import { Industry } from '../models/Industry';
import { Location } from '../models/Location';
import { Faq } from '../models/Faq';
import { Testimonial } from '../models/Testimonial';
import { ClientLogo } from '../models/ClientLogo';
import { TeamMember } from '../models/TeamMember';
import { CaseStudy } from '../models/CaseStudy';
import { Portfolio } from '../models/Portfolio';
import { Package } from '../models/Package';
import { BlogPost } from '../models/BlogPost';
import { BlogCategory } from '../models/BlogCategory';
import { BlogTag } from '../models/BlogTag';
import { BlogAuthor } from '../models/BlogAuthor';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';

// 1. Homepage Aggregated Payload
export const getPublicHomepage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [featuredServices, caseStudies, testimonials, clients, latestBlogPosts] = await Promise.all([
      Service.find({ status: 'Published', isFeatured: true }).limit(6).lean(),
      CaseStudy.find({ status: 'Published', isFeatured: true }).limit(4).lean(),
      Testimonial.find({ status: 'Published' }).limit(6).lean(),
      ClientLogo.find({ status: 'Published' }).limit(12).lean(),
      BlogPost.find({ status: 'Published' }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);

    sendSuccess(
      res,
      {
        featuredServices,
        caseStudies,
        testimonials,
        clients,
        latestBlogPosts,
      },
      'Homepage content retrieved',
      200
    );
  } catch (error) {
    next(error);
  }
};

// 2. Services & Categories
export const getPublicServices = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category } = req.query;
    const filter: Record<string, any> = { status: 'Published' };
    if (category) filter.category = category;

    const services = await Service.find(filter).sort({ order: 1, title: 1 }).lean();
    sendSuccess(res, services, 'Published services retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicServiceBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const service = await Service.findOne({ slug, status: 'Published' }).lean();
    if (!service) {
      return next(new AppError('Service not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, service, 'Service detail retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicServiceCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await ServiceCategory.find({ status: 'Published' }).sort({ title: 1 }).lean();
    sendSuccess(res, categories, 'Service categories retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 3. Pages
export const getPublicPages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const pages = await Page.find({ status: 'Published' }).select('title slug metaDescription').lean();
    sendSuccess(res, pages, 'Published pages retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicPageBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const page = await Page.findOne({ slug, status: 'Published' }).lean();
    if (!page) {
      return next(new AppError('Page not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, page, 'Page details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 4. Industries
export const getPublicIndustries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const industries = await Industry.find({ status: 'Published' }).sort({ title: 1 }).lean();
    sendSuccess(res, industries, 'Published industries retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicIndustryBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const industry = await Industry.findOne({ slug, status: 'Published' }).lean();
    if (!industry) {
      return next(new AppError('Industry vertical not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, industry, 'Industry details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 5. Locations
export const getPublicLocations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const locations = await Location.find({ status: 'Published' }).sort({ title: 1 }).lean();
    sendSuccess(res, locations, 'Published locations retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicLocationBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const location = await Location.findOne({ slug, status: 'Published' }).lean();
    if (!location) {
      return next(new AppError('Location page not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, location, 'Location details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 6. Packages
export const getPublicPackages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const packages = await Package.find({ status: 'Published' }).sort({ price: 1 }).lean();
    sendSuccess(res, packages, 'Published packages retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 7. Testimonials & FAQs
export const getPublicTestimonials = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const testimonials = await Testimonial.find({ status: 'Published' }).sort({ order: 1 }).lean();
    sendSuccess(res, testimonials, 'Published testimonials retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicFaqs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const faqs = await Faq.find({ status: 'Published' }).sort({ order: 1 }).lean();
    sendSuccess(res, faqs, 'Published FAQs retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 8. Case Studies & Portfolio
export const getPublicCaseStudies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const caseStudies = await CaseStudy.find({ status: 'Published' }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, caseStudies, 'Published case studies retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicCaseStudyBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const caseStudy = await CaseStudy.findOne({ slug, status: 'Published' }).lean();
    if (!caseStudy) {
      return next(new AppError('Case study not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, caseStudy, 'Case study details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projects = await Portfolio.find({ status: 'Published' }).sort({ createdAt: -1 }).lean();
    sendSuccess(res, projects, 'Published portfolio projects retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicPortfolioBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const project = await Portfolio.findOne({ slug, status: 'Published' }).lean();
    if (!project) {
      return next(new AppError('Portfolio project not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, project, 'Portfolio project details retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 9. Blog System
export const getPublicBlog = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { category, tag, search, page = '1', limit = '10' } = req.query;
    const filter: Record<string, any> = { status: 'Published' };

    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [posts, total] = await Promise.all([
      BlogPost.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      BlogPost.countDocuments(filter),
    ]);

    sendSuccess(
      res,
      posts,
      'Published blog posts retrieved',
      200,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)) || 1,
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicBlogBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await BlogPost.findOne({ slug, status: 'Published' }).lean();
    if (!post) {
      return next(new AppError('Blog article not found', 404, 'NOT_FOUND'));
    }
    sendSuccess(res, post, 'Blog article retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicBlogCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await BlogCategory.find({ status: 'Published' }).lean();
    sendSuccess(res, categories, 'Blog categories retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicBlogTags = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tags = await BlogTag.find({ status: 'Published' }).lean();
    sendSuccess(res, tags, 'Blog tags retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicBlogAuthors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authors = await BlogAuthor.find({ status: 'Published' }).lean();
    sendSuccess(res, authors, 'Blog authors retrieved', 200);
  } catch (error) {
    next(error);
  }
};

// 10. Clients & Team Members
export const getPublicClients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const clients = await ClientLogo.find({ status: 'Published' }).sort({ order: 1 }).lean();
    sendSuccess(res, clients, 'Published client logos retrieved', 200);
  } catch (error) {
    next(error);
  }
};

export const getPublicTeam = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const team = await TeamMember.find({ status: 'Published' }).sort({ order: 1 }).lean();
    sendSuccess(res, team, 'Published team members retrieved', 200);
  } catch (error) {
    next(error);
  }
};
