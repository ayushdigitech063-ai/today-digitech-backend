import { Request, Response, NextFunction } from 'express';
import { Lead } from '../models/Lead';
import { sendSuccess } from '../utils/apiResponse';
import { AppError } from '../utils/appError';
import { QueryFeatures } from '../utils/queryFeatures';
import { logAuditAction } from '../utils/auditLogger';
import { sendNewLeadNotification, sendVisitorConfirmation } from '../utils/notificationService';
import { convertLeadsToCSV } from '../utils/csvExporter';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { LeadStatus } from '@today-digitech/shared';

export const submitPublicLead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, phone, name, businessName, website, interestedService, budget, message, formType, landingPage, referrer, utmSource, utmMedium, utmCampaign } = req.body;

    if (!name || !email) {
      return next(new AppError('Name and Email are required to submit an enquiry', 400, 'MISSING_FIELDS'));
    }

    // 24-hour duplicate detection check
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingRecentLead = await Lead.findOne({
      $or: [{ email: email.toLowerCase() }, { phone: phone ? phone : undefined }],
      createdAt: { $gte: twentyFourHoursAgo },
    });

    const isDuplicate = !!existingRecentLead;

    const lead = await Lead.create({
      name,
      businessName,
      phone,
      email: email.toLowerCase(),
      website,
      interestedService,
      budget,
      message,
      formType: formType || 'CONTACT',
      landingPage,
      referrer,
      utmSource,
      utmMedium,
      utmCampaign,
      isDuplicate,
      status: 'NEW',
      statusTimeline: [
        {
          status: 'NEW',
          changedBy: 'System / Form Submission',
          timestamp: new Date(),
          note: `Inquiry submitted via ${formType || 'CONTACT'} form.`,
        },
      ],
    });

    // Send notifications
    await sendNewLeadNotification(lead);
    await sendVisitorConfirmation(lead);

    sendSuccess(res, { id: lead.id, name: lead.name, email: lead.email }, 'Inquiry submitted successfully! Our team will contact you shortly.', 201);
  } catch (error) {
    next(error);
  }
};

export const getLeads = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const features = new QueryFeatures(Lead.find().populate('assignedTo', 'name email'), req.query)
      .filter(['name', 'email', 'phone', 'businessName', 'interestedService'])
      .sort()
      .limitFields();

    const { meta } = await features.paginate();
    const leads = await features.query;

    sendSuccess(res, leads, 'Leads fetched successfully', 200, meta);
  } catch (error) {
    next(error);
  }
};

export const getLeadById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id).populate('assignedTo', 'name email');

    if (!lead) {
      return next(new AppError('Lead record not found', 404, 'NOT_FOUND'));
    }

    sendSuccess(res, lead, 'Lead details fetched successfully');
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, assignedTo, followUpDate, note } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return next(new AppError('Lead record not found', 404, 'NOT_FOUND'));
    }

    if (status && status !== lead.status) {
      lead.statusTimeline.push({
        status: status as LeadStatus,
        changedBy: req.adminUser?.email || 'Admin',
        timestamp: new Date(),
        note: note || `Status updated to ${status}`,
      });
      lead.status = status as LeadStatus;
    }

    if (assignedTo !== undefined) lead.assignedTo = assignedTo || null;
    if (followUpDate !== undefined) lead.followUpDate = followUpDate ? new Date(followUpDate) : undefined;

    if (note) {
      lead.notes.push({
        note,
        author: req.adminUser?.name || req.adminUser?.email || 'Admin User',
        createdAt: new Date(),
      });
    }

    await lead.save();
    await logAuditAction(req, 'UPDATE_LEAD', 'Lead', { leadId: id, newStatus: lead.status });

    sendSuccess(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

export const bulkUpdateLeadStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { leadIds, status } = req.body as { leadIds: string[]; status: LeadStatus };

    if (!Array.isArray(leadIds) || !status) {
      return next(new AppError('Lead IDs array and status required', 400, 'INVALID_PAYLOAD'));
    }

    await Lead.updateMany(
      { _id: { $in: leadIds } },
      {
        $set: { status },
        $push: {
          statusTimeline: {
            status,
            changedBy: req.adminUser?.email || 'Admin',
            timestamp: new Date(),
            note: 'Bulk status update',
          },
        },
      },
    );

    await logAuditAction(req, 'BULK_UPDATE_LEADS', 'Lead', { count: leadIds.length, status });

    sendSuccess(res, null, `${leadIds.length} leads updated to status ${status}`);
  } catch (error) {
    next(error);
  }
};

export const exportLeadsCSV = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    const csvData = convertLeadsToCSV(leads);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=today-digitech-leads-${Date.now()}.csv`);
    res.status(200).send(csvData);
  } catch (error) {
    next(error);
  }
};
