import { User } from './user.model';

export interface Event {
  eventId?: number;
  eventName: string;
  description?: string;
  eventDate: string;
  eventTime: string;
  venue?: string;
}
