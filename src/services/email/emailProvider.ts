export interface EmailMessage {
  to: string[];
  from: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailDeliveryResult {
  messageId?: string;
}

export interface EmailProvider {
  readonly name: string;
  send(message: EmailMessage): Promise<EmailDeliveryResult>;
}

export type EmailFailureKind = 'authentication' | 'timeout' | 'smtp' | 'validation' | 'template';

export class EmailDeliveryError extends Error {
  constructor(
    public readonly kind: EmailFailureKind,
    public readonly transient: boolean,
    message: string,
  ) {
    super(message);
    this.name = 'EmailDeliveryError';
  }
}
