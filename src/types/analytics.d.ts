import { BaseCmsItem } from './cms';
export interface AnalyticsSettingsDTO extends BaseCmsItem {
    ga4MeasurementId?: string;
    gscVerificationTag?: string;
    metaPixelId?: string;
    googleAdsConversionId?: string;
    googleAdsConversionLabel?: string;
    scriptHeaderCustom?: string;
    scriptBodyCustom?: string;
}
export interface MetricCount {
    label: string;
    count: number;
}
export interface DashboardMetricsDTO {
    totalLeads: number;
    newLeads: number;
    pendingFollowUps: number;
    qualifiedLeads: number;
    leadsByService: MetricCount[];
    leadsBySource: MetricCount[];
    leadsByStatus: MetricCount[];
    leadsByDate: Array<{
        date: string;
        count: number;
    }>;
    formConversions: {
        totalSubmissions: number;
        contactForm: number;
        auditForm: number;
        quoteForm: number;
        serviceEnquiry: number;
    };
    thirdPartyStatus: {
        ga4Connected: boolean;
        metaPixelConnected: boolean;
        googleAdsConnected: boolean;
        gscVerified: boolean;
    };
}
//# sourceMappingURL=analytics.d.ts.map