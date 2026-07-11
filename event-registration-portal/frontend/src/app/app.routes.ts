import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard';
import { EventListComponent } from './components/event-list/event-list';
import { EventCreateComponent } from './components/event-create/event-create';
import { RegisterParticipantComponent } from './components/register-participant/register-participant';
import { ParticipantListComponent } from './components/participant-list/participant-list';
import { UserListComponent } from './components/user-list/user-list';
import { SettingsComponent } from './components/settings/settings';
import { ProfileComponent } from './components/profile/profile';
import { HelpComponent } from './components/help/help';
import { NotFoundComponent } from './components/not-found/not-found';
import { AuthComponent } from './components/auth/auth';
import { LandingComponent } from './components/landing/landing';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'login', component: AuthComponent },
  { path: 'events', component: EventListComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'events/create', component: EventCreateComponent, canActivate: [AuthGuard] },
  { path: 'register-participant', component: RegisterParticipantComponent, canActivate: [AuthGuard] },
  { path: 'participants', component: ParticipantListComponent, canActivate: [AuthGuard] },
  { path: 'users', component: UserListComponent, canActivate: [AuthGuard] },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'help', component: HelpComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', component: NotFoundComponent }
];
