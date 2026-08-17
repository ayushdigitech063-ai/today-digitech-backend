import { Request, Response, NextFunction } from 'express';
import { AnalyticsSettings } from '../models/AnalyticsSettings';
import { Lead } from '../models/Lead';
import { sendSuccess } from '../utils/apiResponse';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export const getPublicAnalyticsScripts = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await AnalyticsSettings.findOne({ isActive: true });
    sendSuccess(
      res,
      {
        ga4MeasurementId: settings?.ga4MeasurementId || '',
        gscVerificationTag: settings?.gscVerificationTag || '',
        metaPixelId: settings?.metaPixelId || '',
        googleAdsConversionId: settings?.googleAdsConversionId || '',
        googleAdsConversionLabel: settings?.googleAdsConversionLabel || '',
      },
      'Public analytics scripts fetched',
    );
  } catch (error) {
    next(error);
  }
};

export const getDashboardAnalytics = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const settings = await AnalyticsSettings.findOne({ isActive: true });

    const totalLeads = await Lead.countDocuments();
    const newLeads = await Lead.countDocuments({ status: 'NEW' });
    const pendingFollowUps = await Lead.countDocuments({
      followUpDate: { $lte: new Date() },
      status: { $nin: ['WON', 'LOST', 'SPAM'] },
    });
    const qualifiedLeads = await Lead.countDocuments({ status: 'QUALIFIED' });

    // Leads by service
    const serviceAgg = await Lead.aggregate([
      { $group: { _id: '$interestedService', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Leads by source
    const sourceAgg = await Lead.aggregate([
      { $group: { _id: '$leadSource', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // Leads by status
    const statusAgg = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const [contactForm, auditForm, quoteForm, serviceEnquiry] = await Promise.all([
      Lead.countDocuments({ formType: 'CONTACT' }),
      Lead.countDocuments({ formType: 'FREE_AUDIT' }),
      Lead.countDocuments({ formType: 'GET_QUOTE' }),
      Lead.countDocuments({ formType: 'SERVICE_ENQUIRY' }),
    ]);

    sendSuccess(
      res,
      {
        totalLeads,
        newLeads,
        pendingFollowUps,
        qualifiedLeads,
        leadsByService: serviceAgg.map((s) => ({ label: s._id || 'General Enquiry', count: s.count })),
        leadsBySource: sourceAgg.map((s) => ({ label: s._id || 'Organic Direct', count: s.count })),
        leadsByStatus: statusAgg.map((s) => ({ label: s._id || 'NEW', count: s.count })),
        leadsByDate: [],
        formConversions: {
          totalSubmissions: totalLeads,
          contactForm,
          auditForm,
          quoteForm,
          serviceEnquiry,
        },
        thirdPartyStatus: {
          ga4Connected: Boolean(settings?.ga4MeasurementId),
          metaPixelConnected: Boolean(settings?.metaPixelId),
          googleAdsConnected: Boolean(settings?.googleAdsConversionId),
          gscVerified: Boolean(settings?.gscVerificationTag),
        },
      },
      'Dashboard analytics fetched',
    );
  } catch (error) {
    next(error);
  }
};
