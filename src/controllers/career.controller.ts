import { Request, Response, NextFunction } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { JobPosting } from '../models/JobPosting';
import { Application } from '../models/Application';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { ApplicationStatus } from '@today-digitech/shared';

// ── Public endpoints ──

export const getPublicJobs = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const jobs = await JobPosting.find({ status: 'Published', isActive: true }).sort({ order: 1, createdAt: -1 });
    sendSuccess(res, jobs, 'Open positions fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const getPublicJobBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const job = await JobPosting.findOne({ slug: req.params.slug, status: 'Published', isActive: true });
    if (!job) return next(new AppError('Job posting not found', 404, 'NOT_FOUND'));
    sendSuccess(res, job, 'Job detail fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const submitApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { jobId, applicantName, email, phone, coverLetter, linkedinUrl, portfolioUrl } = req.body;

    if (!applicantName || !email || !phone || !jobId) {
      return next(new AppError('Name, Email, Phone, and Job ID are required', 400, 'MISSING_FIELDS'));
    }

    const job = await JobPosting.findById(jobId);
    if (!job) return next(new AppError('Job posting not found', 404, 'NOT_FOUND'));

    // Upload resume to Cloudinary private/signed access
    let resumeUrl = '';
    let resumePublicId = '';

    if (req.file) {
      const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'today-digitech/careers/resumes',
            resource_type: 'raw',
            type: 'private',
            access_mode: 'authenticated',
          },
          (error, result) => {
            if (error || !result) return reject(error || new Error('Upload failed'));
            resolve({ secure_url: result.secure_url, public_id: result.public_id });
          },
        );
        stream.end(req.file!.buffer);
      });
      resumeUrl = result.secure_url;
      resumePublicId = result.public_id;
    } else {
      return next(new AppError('Resume file is required', 400, 'MISSING_RESUME'));
    }

    const application = await Application.create({
      job: jobId,
      applicantName,
      email: email.toLowerCase(),
      phone,
      resumeUrl,
      resumePublicId,
      coverLetter,
      linkedinUrl,
      portfolioUrl,
      status: 'NEW',
      statusTimeline: [
        {
          status: 'NEW',
          changedBy: 'System / Application Form',
          timestamp: new Date(),
          note: `Application submitted for ${job.title}.`,
        },
      ],
    });

    sendSuccess(res, { id: application.id }, 'Application submitted successfully! We will review and get back to you shortly.', 201);
  } catch (error) {
    next(error);
  }
};

// ── Admin endpoints ──

export const getAdminJobs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const features = new QueryFeatures(JobPosting.find(), req.query).filter(['title', 'department']).sort().limitFields();
    const { meta } = await features.paginate();
    const jobs = await features.query;
    sendSuccess(res, jobs, 'Jobs fetched successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getApplications = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const features = new QueryFeatures(Application.find().populate('job', 'title slug department'), req.query)
      .filter(['applicantName', 'email', 'phone'])
      .sort()
      .limitFields();
    const { meta } = await features.paginate();
    const applications = await features.query;
    sendSuccess(res, applications, 'Applications fetched successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id).populate('job', 'title slug department');
    if (!application) return next(new AppError('Application not found', 404, 'NOT_FOUND'));
    sendSuccess(res, application, 'Application detail fetched');
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, note } = req.body;
    const application = await Application.findById(req.params.id);
    if (!application) return next(new AppError('Application not found', 404, 'NOT_FOUND'));

    if (status && status !== application.status) {
      application.statusTimeline.push({
        status: status as ApplicationStatus,
        changedBy: req.adminUser?.email || 'Admin',
        timestamp: new Date(),
        note: note || `Status changed to ${status}`,
      });
      application.status = status as ApplicationStatus;
    }

    if (note) {
      application.notes.push({
        note,
        author: req.adminUser?.name || req.adminUser?.email || 'Admin',
        createdAt: new Date(),
      });
    }

    await application.save();
    await logAuditAction(req, 'UPDATE_APPLICATION', 'Application', { applicationId: req.params.id, newStatus: application.status });
    sendSuccess(res, application, 'Application updated successfully');
  } catch (error) {
    next(error);
  }
};

export const getResumeSignedUrl = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) return next(new AppError('Application not found', 404, 'NOT_FOUND'));

    const signedUrl = cloudinary.utils.private_download_url(application.resumePublicId, 'raw', {
      expires_at: Math.floor(Date.now() / 1000) + 300, // 5-minute expiry
    });

    sendSuccess(res, { signedUrl }, 'Resume signed URL generated (5-minute expiry)');
  } catch (error) {
    next(error);
  }
};
