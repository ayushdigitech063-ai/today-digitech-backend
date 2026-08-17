import { env } from '../config/env';
import { ILead } from '../models/Lead';
import {
  createInternalLeadEmail,
  createPasswordResetEmail,
  createVisitorConfirmationEmail,
} from '../services/email/emailTemplates';
import { EmailDeliveryError, EmailMessage, EmailProvider } from '../services/email/emailProvider';
import { SmtpEmailProvider } from '../services/email/smtpEmailProvider';

type NotificationType = 'internal_lead' | 'visitor_confirmation' | 'free_audit_confirmation' | 'password_reset';

interface NotificationServiceOptions {
  enabled: boolean;
  provider?: EmailProvider;
  recipients: string[];
  from?: string;
  replyTo?: string;
  brandName?: string;
  contactEmail?: string;
  retryMax?: number;
  retryBaseDelayMs?: number;
  frontendUrl: string;
}

const wait = (durationMs: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, durationMs));

const logDelivery = (data: Record<string, unknown>): void => {
  console.info(JSON.stringify({ event: 'email_delivery', ...data }));
};

export class NotificationService {
  constructor(private readonly options: NotificationServiceOptions) {}

  async sendNewLeadNotification(lead: ILead): Promise<void> {
    if (!this.options.enabled) {
      this.logSkipped('internal_lead', lead.email);
      return;
    }

    await this.renderAndDeliver(
      'internal_lead',
      this.options.recipients,
      () => createInternalLeadEmail(this.options.recipients, this.getBranding(), lead),
    );
  }

  async sendVisitorConfirmation(lead: ILead): Promise<void> {
    if (!this.options.enabled) {
      this.logSkipped(lead.formType === 'FREE_AUDIT' ? 'free_audit_confirmation' : 'visitor_confirmation', lead.email);
      return;
    }

    await this.renderAndDeliver(
      lead.formType === 'FREE_AUDIT' ? 'free_audit_confirmation' : 'visitor_confirmation',
      [lead.email],
      () => createVisitorConfirmationEmail(this.getBranding(), lead),
    );
  }

  async sendPasswordResetEmail(recipient: string, resetToken: string, resetUrl?: string): Promise<void> {
    if (!this.options.enabled) {
      this.logSkipped('password_reset', recipient);
      return;
    }

    const resetLink = resetUrl ? new URL(resetUrl) : new URL('/reset-password', this.options.frontendUrl);
    if (!resetUrl) {
      resetLink.searchParams.set('token', resetToken);
    }
    await this.renderAndDeliver(
      'password_reset',
      [recipient],
      () => createPasswordResetEmail(this.getBranding(), recipient, resetLink.toString()),
    );
  }

  private getBranding() {
    if (!this.options.from || !this.options.replyTo || !this.options.brandName || !this.options.contactEmail) {
      throw new EmailDeliveryError('validation', false, 'Email branding configuration is incomplete');
    }

    return {
      from: this.options.from,
      replyTo: this.options.replyTo,
      brandName: this.options.brandName,
      contactEmail: this.options.contactEmail,
    };
  }

  private async deliver(type: NotificationType, message: EmailMessage): Promise<void> {
    const startedAt = Date.now();
    const provider = this.options.provider;
    const retryMax = this.options.retryMax || 0;
    const retryBaseDelayMs = this.options.retryBaseDelayMs || 0;

    if (!provider) {
      this.logFailure(type, message.to, 'unavailable', 0, startedAt, 'validation', 'Email provider is unavailable');
      return;
    }

    for (let attempt = 0; attempt <= retryMax; attempt += 1) {
      try {
        await provider.send(message);
        logDelivery({
          type,
          recipients: message.to,
          provider: provider.name,
          status: 'sent',
          durationMs: Date.now() - startedAt,
          retries: attempt,
        });
        return;
      } catch (error) {
        const deliveryError = this.toDeliveryError(error);
        const canRetry = deliveryError.transient && attempt < retryMax;

        if (!canRetry) {
          this.logFailure(
            type,
            message.to,
            provider.name,
            attempt,
            startedAt,
            deliveryError.kind,
            deliveryError.message,
          );
          return;
        }

        await wait(retryBaseDelayMs * 2 ** attempt);
      }
    }
  }

  private async renderAndDeliver(
    type: NotificationType,
    recipients: string[],
    render: () => EmailMessage,
  ): Promise<void> {
    try {
      await this.deliver(type, render());
    } catch (error) {
      const deliveryError = this.toDeliveryError(error);
      this.logFailure(
        type,
        recipients,
        this.options.provider?.name || 'unavailable',
        0,
        Date.now(),
        deliveryError.kind,
        deliveryError.message,
      );
    }
  }

  private toDeliveryError(error: unknown): EmailDeliveryError {
    if (error instanceof EmailDeliveryError) return error;
    if (error instanceof Error) return new EmailDeliveryError('template', false, 'Email template rendering failed');
    return new EmailDeliveryError('smtp', false, 'Unknown email delivery failure');
  }

  private logSkipped(type: NotificationType, recipient: string): void {
    logDelivery({ type, recipients: [recipient], provider: 'smtp', status: 'disabled', durationMs: 0, retries: 0 });
  }

  private logFailure(
    type: NotificationType,
    recipients: string[],
    provider: string,
    retries: number,
    startedAt: number,
    failureKind: string,
    failureReason: string,
  ): void {
    logDelivery({
      type,
      recipients,
      provider,
      status: 'failed',
      durationMs: Date.now() - startedAt,
      retries,
      failureKind,
      failureReason,
    });
  }
}

export const createNotificationService = (options: NotificationServiceOptions): NotificationService =>
  new NotificationService(options);

const defaultNotificationService = createNotificationService({
  enabled: env.EMAIL_ENABLED,
  provider: env.EMAIL_ENABLED ? new SmtpEmailProvider() : undefined,
  recipients: env.ADMIN_NOTIFICATION_EMAILS,
  from: env.SMTP_FROM,
  replyTo: env.SMTP_REPLY_TO,
  brandName: env.EMAIL_BRAND_NAME,
  contactEmail: env.EMAIL_CONTACT_EMAIL,
  retryMax: env.EMAIL_RETRY_MAX,
  retryBaseDelayMs: env.EMAIL_RETRY_BASE_DELAY_MS,
  frontendUrl: env.FRONTEND_URL,
});

export const sendNewLeadNotification = async (lead: ILead): Promise<void> =>
  defaultNotificationService.sendNewLeadNotification(lead);

export const sendVisitorConfirmation = async (lead: ILead): Promise<void> =>
  defaultNotificationService.sendVisitorConfirmation(lead);

export const sendPasswordResetEmail = async (
  recipient: string,
  resetToken: string,
  resetUrl?: string,
): Promise<void> => defaultNotificationService.sendPasswordResetEmail(recipient, resetToken, resetUrl);
