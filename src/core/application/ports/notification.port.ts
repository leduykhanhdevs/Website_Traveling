export interface NotificationMessage {
  readonly to: string;
  readonly subject: string;
  readonly contentText: string;
}

export interface NotificationPort {
  readonly providerName: string;
  send(message: NotificationMessage): Promise<{ success: boolean; id?: string }>;
}
