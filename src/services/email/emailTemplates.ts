import { ILead } from '../../models/Lead';
import { EmailMessage } from './emailProvider';

interface EmailBranding {
  brandName: string;
  contactEmail: string;
  from: string;
  replyTo: string;
}

const escapeHtml = (value: string | undefined): string =>
  (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const toText = (value: string | undefined): string => (value || '').replace(/[\r\n]+/g, ' ').trim();

const toHeaderText = (value: string | undefined): string => toText(value).replace(/[\r\n]/g, '');

const layout = (branding: EmailBranding, title: string, body: string): string => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:24px 12px;">
      <tr><td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;background:#ffffff;border-radius:10px;overflow:hidden;">
          <tr><td style="padding:24px 32px;background:#041f49;color:#ffffff;font-size:22px;font-weight:700;">${escapeHtml(branding.brandName)}</td></tr>
          <tr><td style="padding:32px;font-size:16px;line-height:1.6;">${body}</td></tr>
          <tr><td style="padding:20px 32px;background:#f8fafc;color:#64748b;font-size:13px;line-height:1.5;">Questions? Contact us at <a href="mailto:${escapeHtml(branding.contactEmail)}" style="color:#07448d;">${escapeHtml(branding.contactEmail)}</a>.</td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

const leadDetails = (lead: ILead): string => {
  const values: Array<[string, string | undefined]> = [
    ['Name', lead.name],
    ['Email', lead.email],
    ['Phone', lead.phone],
    ['Company', lead.businessName],
    ['Interested Service', lead.interestedService],
    ['Message', lead.message],
    ['Submitted', lead.createdAt?.toISOString()],
  ];

  return values
    .filter(([, value]) => Boolean(value))
    .map(([label, value]) => `<tr><td style="padding:8px 0;font-weight:700;vertical-align:top;width:160px;">${escapeHtml(label)}</td><td style="padding:8px 0;white-space:pre-wrap;">${escapeHtml(value)}</td></tr>`)
    .join('');
};

export const createInternalLeadEmail = (
  recipients: string[],
  branding: EmailBranding,
  lead: ILead,
): EmailMessage => {
  const subject = `New ${lead.formType} lead from ${toHeaderText(lead.name)}`;
  const text = [
    subject,
    `Name: ${toText(lead.name)}`,
    `Email: ${toText(lead.email)}`,
    `Phone: ${toText(lead.phone)}`,
    `Company: ${toText(lead.businessName)}`,
    `Interested Service: ${toText(lead.interestedService)}`,
    `Message: ${toText(lead.message)}`,
    `Submitted: ${lead.createdAt.toISOString()}`,
  ].join('\n');

  return {
    to: recipients,
    from: branding.from,
    replyTo: branding.replyTo,
    subject,
    text,
    html: layout(
      branding,
      subject,
      `<h1 style="margin-top:0;font-size:24px;">New lead received</h1><p>A new ${escapeHtml(lead.formType)} enquiry has been submitted.</p><table role="presentation" width="100%" cellspacing="0" cellpadding="0">${leadDetails(lead)}</table>`,
    ),
  };
};

export const createVisitorConfirmationEmail = (branding: EmailBranding, lead: ILead): EmailMessage => {
  const isFreeAudit = lead.formType === 'FREE_AUDIT';
  const subject = isFreeAudit
    ? `${branding.brandName}: your website audit request was received`
    : `${branding.brandName}: thank you for contacting us`;
  const introduction = isFreeAudit
    ? 'We have received your website audit request. Our team will review it and respond within one business day.'
    : 'Thank you for contacting us. Our team has received your enquiry and will respond within one business day.';
  const nextSteps = isFreeAudit
    ? 'We will review the information you provided and share the next steps for your audit.'
    : 'We will review your requirements and contact you to discuss the next steps.';

  return {
    to: [lead.email],
    from: branding.from,
    replyTo: branding.replyTo,
    subject,
    text: [`Hello ${toText(lead.name)},`, '', introduction, nextSteps, '', `Contact: ${branding.contactEmail}`].join('\n'),
    html: layout(
      branding,
      subject,
      `<h1 style="margin-top:0;font-size:24px;">Thank you, ${escapeHtml(lead.name)}</h1><p>${escapeHtml(introduction)}</p><p>${escapeHtml(nextSteps)}</p>`,
    ),
  };
};

export const createPasswordResetEmail = (
  branding: EmailBranding,
  recipient: string,
  resetLink: string,
): EmailMessage => {
  const subject = `${branding.brandName}: reset your password`;
  return {
    to: [recipient],
    from: branding.from,
    replyTo: branding.replyTo,
    subject,
    text: [
      'A password reset was requested for your administrator account.',
      `Reset your password: ${resetLink}`,
      'This link expires in 10 minutes. If you did not request this, ignore this email and contact support.',
    ].join('\n\n'),
    html: layout(
      branding,
      subject,
      '<h1 style="margin-top:0;font-size:24px;">Password reset request</h1><p>A password reset was requested for your administrator account.</p><p><a href="' + escapeHtml(resetLink) + '" style="display:inline-block;padding:12px 18px;background:#07448d;color:#ffffff;text-decoration:none;border-radius:6px;">Reset password</a></p><p>This link expires in 10 minutes. If you did not request this, ignore this email and contact support.</p>',
    ),
  };
};
