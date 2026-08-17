import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../../config/env';
import {
  EmailDeliveryError,
  EmailDeliveryResult,
  EmailMessage,
  EmailProvider,
} from './emailProvider';

const getSmtpError = (error: unknown): EmailDeliveryError => {
  const details = error as { code?: string; responseCode?: number; message?: string };
  const code = details.code || '';
  const responseCode = details.responseCode;
  if (code === 'EAUTH' || responseCode === 535) {
    return new EmailDeliveryError('authentication', false, 'SMTP authentication failed');
  }

  if (code === 'ETIMEDOUT' || code === 'ESOCKETTIMEDOUT') {
    return new EmailDeliveryError('timeout', true, 'SMTP connection timed out');
  }

  const transient =
    code === 'ECONNRESET' ||
    code === 'ECONNREFUSED' ||
    code === 'EPIPE' ||
    (typeof responseCode === 'number' && responseCode >= 400 && responseCode < 500);

  return new EmailDeliveryError('smtp', transient, 'SMTP delivery failed');
};

export class SmtpEmailProvider implements EmailProvider {
  public readonly name = 'smtp';
  private readonly transporter: Transporter;

  constructor() {
    if (
      !env.SMTP_HOST ||
      !env.SMTP_PORT ||
      !env.SMTP_USER ||
      !env.SMTP_PASSWORD ||
      env.SMTP_SECURE === undefined ||
      !env.SMTP_TIMEOUT_MS
    ) {
      throw new Error('SMTP provider cannot be initialized without complete SMTP configuration');
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASSWORD,
      },
      connectionTimeout: env.SMTP_TIMEOUT_MS,
      greetingTimeout: env.SMTP_TIMEOUT_MS,
      socketTimeout: env.SMTP_TIMEOUT_MS,
    });
  }

  async send(message: EmailMessage): Promise<EmailDeliveryResult> {
    try {
      const result = await this.transporter.sendMail(message);
      return { messageId: result.messageId };
    } catch (error) {
      throw getSmtpError(error);
    }
  }
}
