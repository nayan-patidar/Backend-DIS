import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { UserNotificationService } from '../../services/user-notification.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container-fluid py-2">
      <!-- Top header -->
      <div class="mb-4">
        <a routerLink="/events" class="text-decoration-none text-muted small hover-primary d-inline-flex align-items-center gap-1">
          <i class="bi bi-arrow-left"></i> Back to Events Directory
        </a>
      </div>

      <!-- Split Layout Grid -->
      <div class="row g-4">
        <!-- Left Column: Form Builder Container -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <div class="d-flex align-items-center mb-4 border-bottom pb-3">
                <div class="bg-primary-subtle text-primary rounded-3 p-3 me-3" style="width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
                  <i class="bi bi-calendar-plus-fill fs-4"></i>
                </div>
                <div>
                  <h3 class="fw-bold text-dark mb-0">Create Event</h3>
                  <p class="text-muted small mb-0">Schedule and configure a new public registry.</p>
                </div>
              </div>

              <!-- Form -->
              <form [formGroup]="eventForm" (ngSubmit)="onSubmit()">
                <!-- Event Name -->
                <div class="form-floating mb-4">
                  <input
                    type="text"
                    id="eventName"
                    formControlName="eventName"
                    class="form-control"
                    [class.is-invalid]="isFieldInvalid('eventName')"
                    placeholder="Enter event name"
                  />
                  <label for="eventName">Event Title <span class="text-danger">*</span></label>
                  <div class="invalid-feedback" *ngIf="eventForm.get('eventName')?.errors?.['required']">
                    Event title is required.
                  </div>
                </div>

                <!-- Description -->
                <div class="mb-4">
                  <label for="description" class="form-label text-muted small fw-semibold">Event Description</label>
                  <textarea
                    id="description"
                    formControlName="description"
                    class="form-control"
                    rows="3"
                    maxlength="200"
                    placeholder="Provide details about agenda, topics, speakers, etc..."
                  ></textarea>
                  <div class="d-flex justify-content-between align-items-center mt-1">
                    <span class="text-muted small" style="font-size: 0.7rem;">Provide clear guidelines.</span>
                    <span class="text-muted small" style="font-size: 0.7rem;">
                      {{ eventForm.get('description')?.value?.length || 0 }} / 200 chars
                    </span>
                  </div>
                </div>

                <div class="row g-3 mb-4">
                  <!-- Event Date -->
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="date"
                        id="eventDate"
                        formControlName="eventDate"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('eventDate')"
                      />
                      <label for="eventDate">Schedule Date <span class="text-danger">*</span></label>
                      <div class="invalid-feedback" *ngIf="eventForm.get('eventDate')?.errors?.['required']">
                        Event date is required.
                      </div>
                    </div>
                  </div>

                  <!-- Event Time -->
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="time"
                        id="eventTime"
                        formControlName="eventTime"
                        class="form-control"
                        [class.is-invalid]="isFieldInvalid('eventTime')"
                        step="1"
                      />
                      <label for="eventTime">Start Time <span class="text-danger">*</span></label>
                      <div class="invalid-feedback" *ngIf="eventForm.get('eventTime')?.errors?.['required']">
                        Event time is required.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row g-3 mb-4">
                  <!-- Venue -->
                  <div class="col-md-6">
                    <div class="form-floating">
                      <input
                        type="text"
                        id="venue"
                        formControlName="venue"
                        class="form-control"
                        placeholder="E.g., Conference Hall A"
                      />
                      <label for="venue">Event Venue / Location</label>
                    </div>
                  </div>

                  <!-- Removed Creator Organizer field -->
                </div>

                <!-- Removed Capacity slider -->
                <div class="col-md-6 mb-3">
                                    <label for="capacity" class="form-label fw-semibold">Capacity <span class="text-danger">*</span></label>
                                    <input
                                      type="number"
                                      id="capacity"
                                      formControlName="capacity"
                                      class="form-control"
                                      [class.is-invalid]="isFieldInvalid('capacity')"
                                      placeholder="E.g., 100"
                                    />
                                    <div class="invalid-feedback" *ngIf="eventForm.get('capacity')?.errors?.['required']">
                                      Capacity is required.
                                    </div>
                                    <div class="invalid-feedback" *ngIf="eventForm.get('capacity')?.errors?.['min']">
                                      Capacity must be at least 1.
                                    </div>
                                  </div>

                <!-- Submit CTAs -->
                <div class="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
                  <a routerLink="/events" class="btn btn-outline-secondary px-4 py-2 border-light-subtle rounded-3">Cancel</a>
                  <button type="submit" [disabled]="submitting" class="btn btn-primary px-4 py-2 rounded-3">
                    <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Publish Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Right Column: Live Card Preview -->
        <div class="col-lg-5">
          <div class="sticky-lg-top" style="top: 2rem; z-index: 10;">
            <h5 class="fw-bold text-dark mb-3">Live Card Preview</h5>

            <div class="card border-0 shadow-lg overflow-hidden event-preview-card position-relative">
              <!-- Accent Line border -->
              <div class="accent-line bg-primary"></div>

              <!-- Banner header -->
              <div class="preview-banner p-4 bg-gradient-preview d-flex flex-column justify-content-between position-relative text-white">
                <!-- Date Badge visual -->
                <div class="date-badge-preview bg-white text-dark rounded-3 px-2.5 py-1.5 shadow-sm text-center align-self-start">
                  <span class="d-block preview-day fw-bold leading-none">
                    {{ (eventForm.get('eventDate')?.value | date:'d') || '10' }}
                  </span>
                  <span class="d-block preview-month text-muted text-uppercase fw-semibold">
                    {{ (eventForm.get('eventDate')?.value | date:'MMM') || 'AUG' }}
                  </span>
                </div>

                <div class="mt-4 z-2 position-relative">
                  <span class="badge bg-success-subtle text-success mb-2">Upcoming</span>
                  <h4 class="fw-bold mb-0 text-white text-truncate">
                    {{ eventForm.get('eventName')?.value || 'Untitled Event' }}
                  </h4>
                </div>
                <div class="banner-overlay-preview"></div>
              </div>

              <!-- Card Body Details -->
              <div class="card-body p-4 d-flex flex-column justify-content-between bg-white">
                <div>
                  <p class="text-muted small preview-description mb-4">
                    {{ eventForm.get('description')?.value || 'Provide details about the workshop, speakers, and topics on the form to see them update in real-time here.' }}
                  </p>

                  <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-clock me-2 text-primary fs-5"></i>
                      <span>Time: {{ eventForm.get('eventTime')?.value || '09:00:00' }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-geo-alt me-2 text-danger fs-5"></i>
                      <span class="text-truncate">Venue: {{ eventForm.get('venue')?.value || 'To Be Announced' }}</span>
                    </div>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .custom-slider::-webkit-slider-runnable-track {
      background: #e2e8f0;
      height: 6px;
      border-radius: 9999px;
    }
    .custom-slider::-webkit-slider-thumb {
      background: var(--primary);
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-top: -5px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    }
    .event-preview-card {
      border-radius: 1.25rem !important;
    }
    .accent-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      z-index: 5;
    }
    .preview-banner {
      height: 160px;
    }
    .bg-gradient-preview {
      background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
    }
    .banner-overlay-preview {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 0%, rgba(15, 23, 42, 0.75) 100%);
      z-index: 1;
    }
    .date-badge-preview {
      width: 50px;
      height: 50px;
      border-radius: 0.75rem !important;
      z-index: 5;
    }
    .preview-day {
      font-size: 1.15rem;
      line-height: 1;
    }
    .preview-month {
      font-size: 0.6rem;
      letter-spacing: 0.5px;
    }
    .leading-none {
      line-height: 1 !important;
    }
    .preview-description {
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      min-height: 3.6em;
      line-height: 1.5;
    }
    .mb-1-5 {
      margin-bottom: 0.375rem !important;
    }
  `]
})
export class EventCreateComponent implements OnInit {
  eventForm!: FormGroup;
  users: User[] = [];
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService,
    private userService: UserService,
    private notification: NotificationService,
    private userNotification: UserNotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadUsers();
  }

  private initForm() {
    this.eventForm = this.fb.group({
      eventName: ['', [Validators.required]],
      description: [''],
      eventDate: ['', [Validators.required]],
      eventTime: ['', [Validators.required]],
      venue: [''],
      capacity: ['', [Validators.required, Validators.min(1)]]
    });
  }

  private loadUsers() {
    // Intentionally left empty as organizer selection was removed
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.eventForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.eventForm.invalid) {
      this.eventForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formValue = this.eventForm.value;

    let timeStr = formValue.eventTime;
    if (timeStr && timeStr.split(':').length === 2) {
      timeStr = `${timeStr}:00`;
    }

    const payload = {
      ...formValue,
      eventTime: timeStr
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.notification.showSuccess('Event created successfully!');
        this.userNotification.addNotification('Event Created', `New event "${payload.eventName}" was created successfully`, 'event');
        this.router.navigate(['/events']);
      },
      error: (err) => {
        console.error('Error creating event', err);
        this.notification.showError(err.error?.message || 'Error occurred while saving the event.');
        this.submitting = false;
      }
    });
  }
}
