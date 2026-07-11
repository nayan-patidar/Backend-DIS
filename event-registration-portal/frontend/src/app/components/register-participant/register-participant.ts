import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Event } from '../../models/event.model';
import { Role } from '../../models/role.enum';
import { Status } from '../../models/status.enum';

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

@Component({
  selector: 'app-register-participant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="cyber-workspace container-fluid py-4">
      <!-- Back Link -->
      <div class="mb-4">
        <a routerLink="/events" class="text-decoration-none cyber-back-link small d-inline-flex align-items-center gap-2">
          <i class="bi bi-terminal"></i> <span>DIRECTORY_ROOT / BACK_TO_CATALOG</span>
        </a>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="cyber-card p-5 text-center my-4">
        <div class="spinner-border text-cyan my-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">LOADING SYSTEM DATA...</span>
        </div>
        <p class="cyber-glow-text mt-3 mb-0">SYNCHRONIZING SECURE DATABASE REGISTRIES...</p>
      </div>

      <!-- Split Layout Grid -->
      <div class="row g-4" *ngIf="!loading">
        
        <!-- Left Column: Hologram Event Summary Card -->
        <div class="col-lg-5">
          <div class="cyber-header-badge mb-2">
            <span class="badge bg-purple-glow">[ SECURE EVENT HOLOGRAM ]</span>
          </div>
          
          <!-- Event selected preview -->
          <div class="cyber-card overflow-hidden h-100 position-relative" *ngIf="selectedEvent">
            <div class="neon-glow-line bg-cyber-gradient"></div>
            
            <!-- Banner Image Area -->
            <div [ngStyle]="getBannerStyle(selectedEvent.eventId)" class="preview-banner p-4 d-flex flex-column justify-content-between position-relative">
              <div class="d-flex justify-content-between align-items-start z-2">
                <div class="cyber-date-badge text-center">
                  <span class="d-block day-text fw-bold">{{ selectedEvent.eventDate | date:'d' }}</span>
                  <span class="d-block month-text text-uppercase fw-semibold">{{ selectedEvent.eventDate | date:'MMM' }}</span>
                </div>
                <span class="cyber-badge-glow text-uppercase" style="font-size: 0.65rem;">
                  SYSTEMS_ACTIVE
                </span>
              </div>
              
              <div class="z-2 mt-4 pt-4">
                <h3 class="cyber-title mb-0 text-white text-truncate">{{ selectedEvent.eventName }}</h3>
              </div>
              <div class="banner-cyber-overlay"></div>
            </div>

            <!-- Body Details -->
            <div class="card-body p-4 bg-cyber-dark text-light d-flex flex-column justify-content-between">
              <div>
                <p class="cyber-desc-text mb-4">
                  {{ selectedEvent.description || 'No descriptive logs found for this index event portal.' }}
                </p>
                
                <div class="d-flex flex-column gap-3 mb-4 border-top border-bottom border-cyber-grey py-3">
                  <div class="d-flex align-items-center text-muted small gap-3">
                    <div class="cyber-icon-box text-cyan"><i class="bi bi-cpu-fill"></i></div>
                    <div>
                      <span class="d-block text-xs text-cyber-muted">CHRONO_TIME</span>
                      <span class="text-white">{{ selectedEvent.eventTime }}</span>
                    </div>
                  </div>
                  <div class="d-flex align-items-center text-muted small gap-3">
                    <div class="cyber-icon-box text-purple"><i class="bi bi-geo-fill"></i></div>
                    <div>
                      <span class="d-block text-xs text-cyber-muted">PORTAL_VENUE</span>
                      <span class="text-white text-truncate">{{ selectedEvent.venue || 'NOT_ASSIGNED' }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Available Seats meter (removed) -->
              <div>
                <div class="d-flex justify-content-between align-items-center small mb-2">
                  <span class="text-cyber-muted">TOTAL REGISTRATIONS</span>
                  <span class="fw-bold text-cyan">{{ getRegisteredCount(selectedEvent.eventId) }} BOOKED</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Fallback -->
          <div class="cyber-card p-5 text-center h-100 d-flex flex-column align-items-center justify-content-center" *ngIf="!selectedEvent">
            <i class="bi bi-hdd-network text-cyber-muted display-2 mb-3"></i>
            <h4 class="fw-bold cyber-title text-cyan mb-2">NO EVENT LINKED</h4>
            <p class="text-muted small mb-0">Please query an event node to compile live preview data.</p>
          </div>
        </div>

        <!-- Right Column: Registration Deck Form -->
        <div class="col-lg-7">
          <div class="cyber-header-badge mb-2">
            <span class="badge bg-cyan-glow">[ SECURE REGISTRY DECK ]</span>
          </div>

          <div class="cyber-card">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center mb-4 border-bottom border-cyber-grey pb-3">
                <div class="cyber-icon-box-large bg-cyber-glow text-cyan me-3">
                  <i class="bi bi-person-fill-add fs-4"></i>
                </div>
                <div>
                  <h3 class="fw-extrabold cyber-title text-white mb-0">TICKET CONSOLE</h3>
                  <p class="text-cyber-muted small mb-0">Initialize attendee registration sequence.</p>
                </div>
              </div>

              <!-- Form -->
              <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
                <!-- Event selector dropdown -->
                <div class="mb-4">
                  <label for="event" class="form-label text-cyber-muted text-xs mb-2">SELECT TARGET PORTAL <span class="text-danger">*</span></label>
                  <select id="event" formControlName="event" class="form-select cyber-input" (change)="onEventChange()" [class.is-invalid]="isFieldInvalid('event')">
                    <option value="" disabled>Query active workshop event catalog...</option>
                    <option *ngFor="let ev of events" [ngValue]="ev">{{ ev.eventName }} [{{ ev.eventDate | date:'mediumDate' }}]</option>
                  </select>
                  <div class="invalid-feedback text-danger text-xs mt-1">Please select an event.</div>
                </div>

                <!-- Tab navigation (For Admin / Existing Switchers) -->
                <div class="cyber-context-card p-3 rounded-3 mb-4" *ngIf="currentRole === 'PARTICIPANT'">
                  <div class="d-flex align-items-center gap-3">
                    <div class="avatar bg-cyber-avatar text-white fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 46px; height: 46px;">
                      {{ getInitials(currentUser?.name) }}
                    </div>
                    <div>
                      <span class="text-cyber-muted small d-block mb-0.5" style="font-size: 0.7rem;">ACTIVE_CONTEXT_HOLDER</span>
                      <h6 class="fw-bold text-white mb-0" style="font-size: 0.95rem;">{{ currentUser?.name }}</h6>
                      <span class="text-cyan small" style="font-size: 0.8rem;">{{ currentUser?.email }}</span>
                    </div>
                  </div>
                </div>

                <!-- Admin Flow switcher -->
                <div class="admin-flow-container mb-4" *ngIf="currentRole === 'ADMIN'">
                  <div class="d-flex gap-2 p-1 bg-cyber-dark border border-cyber-grey rounded-3 mb-4">
                    <button type="button" class="btn btn-sm flex-grow-1 py-2 cyber-tab-btn"
                            [class.active-cyber-tab]="userFlow === 'existing'"
                            (click)="setFlow('existing')">EXISTING MEMBER</button>
                    <button type="button" class="btn btn-sm flex-grow-1 py-2 cyber-tab-btn"
                            [class.active-cyber-tab]="userFlow === 'new'"
                            (click)="setFlow('new')">CREATE NEW IDENTITY</button>
                  </div>

                  <!-- Existing User dropdown -->
                  <div class="mb-4" *ngIf="userFlow === 'existing'">
                    <label for="user" class="form-label text-cyber-muted text-xs mb-2">LINK ATTENDEE PROFILE <span class="text-danger">*</span></label>
                    <select id="user" formControlName="user" class="form-select cyber-input" [class.is-invalid]="isFieldInvalid('user')">
                      <option value="" disabled>Choose database account...</option>
                      <option *ngFor="let u of users" [ngValue]="u">{{ u.name }} [{{ u.email }}]</option>
                    </select>
                    <div class="invalid-feedback text-danger">User account link is required.</div>
                  </div>

                  <!-- New User form fields -->
                  <div formGroupName="newUser" class="d-flex flex-column gap-4 animate-fade-in" *ngIf="userFlow === 'new'">
                    <div class="row g-3">
                      <!-- Name -->
                      <div class="col-md-6">
                        <div>
                          <label for="name" class="form-label text-cyber-muted text-xs mb-2">FULL NAME <span class="text-danger">*</span></label>
                          <input type="text" id="name" formControlName="name" class="form-control cyber-input" [class.is-invalid]="isNewUserFieldInvalid('name')" placeholder="E.g., John Doe" />
                          <div class="invalid-feedback text-danger">Attendee name is required.</div>
                        </div>
                      </div>

                      <!-- Phone -->
                      <div class="col-md-6">
                        <div>
                          <label for="phone" class="form-label text-cyber-muted text-xs mb-2">PHONE SYSTEM</label>
                          <input type="text" id="phone" formControlName="phone" class="form-control cyber-input" placeholder="E.g., 9876543210" />
                        </div>
                      </div>
                    </div>

                    <!-- Email -->
                    <div>
                      <label for="email" class="form-label text-cyber-muted text-xs mb-2">EMAIL CREDENTIAL <span class="text-danger">*</span></label>
                      <input type="email" id="email" formControlName="email" class="form-control cyber-input" [class.is-invalid]="isNewUserFieldInvalid('email')" placeholder="email@address.com" />
                      <div class="invalid-feedback text-danger">Valid email registry required.</div>
                    </div>

                    <!-- Password -->
                    <div>
                      <label for="password" class="form-label text-cyber-muted text-xs mb-2">INITIAL ACCESS PIN <span class="text-danger">*</span></label>
                      <input type="password" id="password" formControlName="password" class="form-control cyber-input" [class.is-invalid]="isNewUserFieldInvalid('password')" placeholder="Minimum 6 characters" />
                      <div class="invalid-feedback text-danger">Password must be at least 6 alphanumeric indices.</div>
                    </div>

                    <!-- Password strength visual -->
                    <div class="cyber-context-card p-3 rounded-3">
                      <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="text-cyber-muted small">PIN_ENTROPY_ANALYSIS</span>
                        <span class="small fw-semibold" [style.color]="getPasswordStrength().color">{{ getPasswordStrength().label }}</span>
                      </div>
                      <div class="progress bg-cyber-dark" style="height: 6px;">
                        <div class="progress-bar rounded-pill" role="progressbar" 
                             [style.width.%]="getPasswordStrength().score * 25"
                             [style.background-color]="getPasswordStrength().color"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Submit buttons -->
                <div class="d-flex justify-content-end gap-3 border-top border-cyber-grey pt-4 mt-4">
                  <a routerLink="/events" class="btn cyber-btn-outline px-4 py-2">CANCEL</a>
                  <button type="submit" [disabled]="submitting" class="btn cyber-btn-primary px-4 py-2">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    CONFIRM_TICKET_SECURE
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;800;900&display=swap');

    .cyber-workspace {
      background-color: #030712 !important;
      color: #f3f4f6 !important;
      min-height: 90vh;
    }
    
    .cyber-title {
      font-family: 'Orbitron', sans-serif !important;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .cyber-back-link {
      font-family: 'Orbitron', sans-serif;
      color: #06b6d4 !important;
      letter-spacing: 1px;
      transition: all 0.25s ease;
    }
    .cyber-back-link:hover {
      text-shadow: 0 0 10px rgba(6, 182, 212, 0.6);
      transform: translateX(-3px);
    }

    .cyber-card {
      background: rgba(17, 24, 39, 0.8) !important;
      border: 1px solid rgba(6, 182, 212, 0.2) !important;
      border-radius: 1rem !important;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.05);
      position: relative;
    }
    
    .neon-glow-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
    }
    .bg-cyber-gradient {
      background: linear-gradient(90deg, #a855f7 0%, #06b6d4 100%);
    }

    .preview-banner {
      height: 160px;
    }
    .banner-cyber-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(3, 7, 18, 0.05) 0%, rgba(3, 7, 18, 0.9) 100%);
      z-index: 1;
    }

    .cyber-date-badge {
      background: rgba(3, 7, 18, 0.75);
      border: 1px solid rgba(6, 182, 212, 0.4);
      border-radius: 0.5rem;
      padding: 0.35rem 0.65rem;
      color: #06b6d4;
      z-index: 5;
      font-family: 'Orbitron', sans-serif;
    }
    .day-text {
      font-size: 1.25rem;
      line-height: 1.1;
    }
    .month-text {
      font-size: 0.6rem;
      letter-spacing: 1px;
    }

    .cyber-badge-glow {
      background: rgba(168, 85, 247, 0.1);
      border: 1px solid rgba(168, 85, 247, 0.4);
      color: #c084fc;
      border-radius: 0.25rem;
      padding: 0.2rem 0.5rem;
      font-family: 'Orbitron', sans-serif;
      z-index: 5;
      text-shadow: 0 0 8px rgba(168, 85, 247, 0.4);
    }

    .bg-cyber-dark {
      background-color: #0b0f19 !important;
    }
    .border-cyber-grey {
      border-color: rgba(75, 85, 99, 0.3) !important;
    }

    .cyber-desc-text {
      color: #9ca3af;
      font-size: 0.875rem;
      line-height: 1.6;
    }
    .text-cyber-muted {
      font-family: 'Orbitron', sans-serif;
      color: #6b7280;
      letter-spacing: 0.5px;
    }

    .cyber-icon-box {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 0.375rem;
      font-size: 1rem;
    }
    .text-cyan {
      color: #06b6d4 !important;
    }
    .text-purple {
      color: #a855f7 !important;
    }

    .bg-cyber-progress {
      background-color: #1f2937 !important;
    }
    .bg-cyber-cyan-glow {
      background: linear-gradient(90deg, #06b6d4, #22d3ee);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
    }

    .cyber-header-badge {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }
    .bg-purple-glow {
      background-color: rgba(168, 85, 247, 0.1);
      color: #c084fc;
      border: 1px solid rgba(168, 85, 247, 0.3);
    }
    .bg-cyan-glow {
      background-color: rgba(6, 182, 212, 0.1);
      color: #22d3ee;
      border: 1px solid rgba(6, 182, 212, 0.3);
    }

    .cyber-icon-box-large {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(6, 182, 212, 0.05);
      border: 1px solid rgba(6, 182, 212, 0.3);
      border-radius: 0.5rem;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.1);
    }

    .cyber-input {
      background-color: #0b0f19 !important;
      border: 1px solid rgba(6, 182, 212, 0.2) !important;
      color: #ffffff !important;
      border-radius: 0.5rem !important;
      font-family: 'Inter', sans-serif;
      padding: 0.75rem 1rem !important;
    }
    .cyber-input:focus {
      border-color: #06b6d4 !important;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.25) !important;
    }

    .cyber-context-card {
      background: rgba(6, 182, 212, 0.03);
      border: 1px solid rgba(6, 182, 212, 0.15);
    }
    .bg-cyber-avatar {
      background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%);
      box-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
    }

    .cyber-tab-btn {
      font-family: 'Orbitron', sans-serif;
      border: 0 !important;
      background: transparent !important;
      color: #9ca3af !important;
      letter-spacing: 0.5px;
      font-size: 0.75rem;
      transition: all 0.25s ease;
    }
    .active-cyber-tab {
      background: #06b6d4 !important;
      color: #030712 !important;
      font-weight: 700;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.3);
    }

    .cyber-btn-outline {
      font-family: 'Orbitron', sans-serif;
      border: 1px solid rgba(156, 163, 175, 0.3) !important;
      color: #9ca3af !important;
      background: transparent !important;
      border-radius: 0.5rem !important;
      letter-spacing: 1px;
      transition: all 0.25s ease;
    }
    .cyber-btn-outline:hover {
      background: rgba(255, 255, 255, 0.05) !important;
      color: #ffffff !important;
      border-color: #ffffff !important;
    }

    .cyber-btn-primary {
      font-family: 'Orbitron', sans-serif;
      background: linear-gradient(90deg, #a855f7 0%, #06b6d4 100%) !important;
      border: 0 !important;
      color: #ffffff !important;
      border-radius: 0.5rem !important;
      letter-spacing: 1px;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
    }
    .cyber-btn-primary:hover {
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
      transform: translateY(-1px);
    }

    .animate-fade-in {
      animation: fadeIn 0.35s ease-out;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class RegisterParticipantComponent implements OnInit {
  events: Event[] = [];
  users: User[] = [];
  currentUser: User | null = null;
  
  loading = true;
  submitting = false;
  currentRole = 'ADMIN';
  currentUserId = 2;

  userFlow: 'existing' | 'new' = 'existing';
  Status = Status;

  selectedEvent: Event | null = null;
  eventRegCountsMap = new Map<number, number>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private userService: UserService,
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentRole = localStorage.getItem('current_role') || 'ADMIN';
    const savedUserId = localStorage.getItem('current_user_id');
    this.currentUserId = savedUserId ? +savedUserId : 2;

    this.initForm();
    this.loadData();
  }

  getBannerStyle(eventId?: number): any {
    const id = eventId || 0;
    let imgUrl = '/images/tech_event.jpg';
    if (id % 3 === 2) imgUrl = '/images/business_event.jpg';
    else if (id % 3 === 0) imgUrl = '/images/music_event.jpg';
    
    return {
      'background': `url('${imgUrl}') no-repeat center center / cover`,
      'height': '150px',
      'border-bottom': '1px solid rgba(6, 182, 212, 0.2)',
      'position': 'relative'
    };
  }

  private initForm() {
    this.registerForm = this.fb.group({
      event: ['', [Validators.required]],
      user: ['', [Validators.required]],
      status: [Status.REGISTERED, [Validators.required]],
      newUser: this.fb.group({
        name: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        phone: [''],
        password: ['', [Validators.required, Validators.minLength(6)]]
      })
    });
    this.disableNewUserValidators();
  }

  registerForm!: FormGroup;

  private loadData() {
    forkJoin({
      events: this.eventService.getAllEvents(),
      users: this.userService.getAllUsers(),
      registrations: this.registrationService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ events, users, registrations }) => {
        this.events = events || [];
        this.users = users || [];
        
        // Find current logged in user context
        this.currentUser = this.users.find(u => u.userId === this.currentUserId) || null;
        if (this.currentUser && this.currentRole === 'PARTICIPANT') {
          this.registerForm.patchValue({ user: this.currentUser });
        }

        // Map registration counts for capacity meter
        const eventRegCounts = new Map<number, number>();
        const registrationsList = registrations || [];
        registrationsList.forEach(r => {
          if (r && r.event?.eventId && r.status === 'REGISTERED') {
            eventRegCounts.set(r.event.eventId, (eventRegCounts.get(r.event.eventId) || 0) + 1);
          }
        });
        this.eventRegCountsMap = eventRegCounts;

        // Check for incoming query params
        this.route.queryParams.subscribe(params => {
          const eventId = params['eventId'];
          if (eventId) {
            const matched = this.events.find(e => e.eventId === +eventId);
            if (matched) {
              this.registerForm.patchValue({ event: matched });
              this.selectedEvent = matched;
            }
          }
        });

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading registers data', err);
        this.notification.showError('Could not sync events and users catalogs.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onEventChange() {
    const val = this.registerForm.get('event')?.value;
    this.selectedEvent = val || null;
  }

  setFlow(flow: 'existing' | 'new') {
    this.userFlow = flow;
    if (flow === 'existing') {
      this.registerForm.get('user')?.setValidators([Validators.required]);
      this.disableNewUserValidators();
    } else {
      this.registerForm.get('user')?.clearValidators();
      this.enableNewUserValidators();
    }
    this.registerForm.get('user')?.updateValueAndValidity();
    this.registerForm.get('newUser')?.updateValueAndValidity();
  }

  private disableNewUserValidators() {
    const newUserGroup = this.registerForm.get('newUser') as FormGroup;
    Object.keys(newUserGroup.controls).forEach(key => {
      newUserGroup.get(key)?.clearValidators();
      newUserGroup.get(key)?.updateValueAndValidity();
    });
  }

  private enableNewUserValidators() {
    const newUserGroup = this.registerForm.get('newUser') as FormGroup;
    newUserGroup.get('name')?.setValidators([Validators.required]);
    newUserGroup.get('email')?.setValidators([Validators.required, Validators.email]);
    newUserGroup.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    
    Object.keys(newUserGroup.controls).forEach(key => {
      newUserGroup.get(key)?.updateValueAndValidity();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  isNewUserFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get('newUser')?.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getPasswordStrength(): PasswordStrength {
    const pass = this.registerForm.get('newUser.password')?.value || '';
    if (!pass) return { score: 0, label: 'Very Weak', color: '#ef4444' };
    
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score++;

    if (score === 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score === 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    return { score: 4, label: 'Strong', color: '#22c55e' };
  }

  getRegisteredCount(eventId?: number): number {
    return this.eventRegCountsMap.get(eventId || 0) || 0;
  }


  getInitials(name?: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.registerForm.value;

    if (this.currentRole === 'PARTICIPANT') {
      this.submitRegistration(this.currentUser!, formValue.event, formValue.status);
    } else {
      if (this.userFlow === 'existing') {
        this.submitRegistration(formValue.user, formValue.event, formValue.status);
      } else {
        const newParticipant: User = {
          name: formValue.newUser.name,
          email: formValue.newUser.email,
          phone: formValue.newUser.phone || null,
          password: formValue.newUser.password,
          role: Role.PARTICIPANT,
          createdAt: new Date().toISOString().split('.')[0]
        };

        this.userService.register(newParticipant).subscribe({
          next: (savedUser) => {
            this.submitRegistration(savedUser, formValue.event, formValue.status);
          },
          error: (err) => {
            console.error('Error creating user during registration', err);
            this.notification.showError(err.error?.message || 'Could not register new user. Email might be in use.');
            this.submitting = false;
          }
        });
      }
    }
  }

  private submitRegistration(user: User, event: Event, status: Status) {
    const registrationPayload = {
      user: {
        userId: user.userId
      },
      event: {
        eventId: event.eventId
      },
      registrationDate: new Date().toISOString().split('.')[0],
      status: status
    };

    this.registrationService.register(registrationPayload as any).subscribe({
      next: () => {
        this.notification.showSuccess('Ticket registered successfully!');
        this.router.navigate(['/participants']);
      },
      error: (err) => {
        console.error('Error submitting registration', err);
        this.notification.showError(err.error?.message || 'Error occurred while registering participant.');
        this.submitting = false;
      }
    });
  }
}
