import { User } from './user.model';
import { Event } from './event.model';
import { Status } from './status.enum';

export interface Registration {
  registrationId?: number;
  user?: User;
  event: Event;
  registrationDate?: string;
  status: Status;
}
