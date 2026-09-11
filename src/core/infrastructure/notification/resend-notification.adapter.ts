import type { NotificationPort, NotificationMessage } from '../../application/ports/notification.port';

export class ResendNotificationAdapter implements NotificationPort {
  public readonly providerName = 'resend-api';

  constructor(
    private readonly apiKey: string,
    private readonly fromEmail: string
  ) {}

  async send(message: NotificationMessage): Promise<{ success: boolean; id?: string }> {
    if (!this.apiKey || !this.fromEmail) {
      throw new Error('Resend credentials not configured');
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(10000),
      headers: {
        Authorization: 'Bearer ' + this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.fromEmail,
        to: [message.to],
        subject: message.subject,
        text: message.contentText,
      }),
    });

    const data: any = await response.json();
    if (!response.ok || !data?.id) {
      throw new Error('Resend rejected email sending');
    }

    return { success: true, id: data.id };
  }
}
