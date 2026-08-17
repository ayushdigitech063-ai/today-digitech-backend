import { ILead } from '../models/Lead';

export const convertLeadsToCSV = (leads: ILead[]): string => {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Business Name',
    'Service',
    'Budget',
    'Status',
    'Form Type',
    'Utm Source',
    'Utm Medium',
    'Utm Campaign',
    'Created At',
  ];

  const rows = leads.map((l) => [
    l.id,
    `"${l.name.replace(/"/g, '""')}"`,
    `"${l.email.replace(/"/g, '""')}"`,
    `"${(l.phone || '').replace(/"/g, '""')}"`,
    `"${(l.businessName || '').replace(/"/g, '""')}"`,
    `"${(l.interestedService || '').replace(/"/g, '""')}"`,
    `"${(l.budget || '').replace(/"/g, '""')}"`,
    l.status,
    l.formType,
    `"${(l.utmSource || '').replace(/"/g, '""')}"`,
    `"${(l.utmMedium || '').replace(/"/g, '""')}"`,
    `"${(l.utmCampaign || '').replace(/"/g, '""')}"`,
    new Date(l.createdAt).toISOString(),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
};
