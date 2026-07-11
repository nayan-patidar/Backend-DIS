import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

interface FAQ {
  question: string;
  answer: string;
  open: boolean;
}

@Component({
  selector: 'app-help',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-2">
      <!-- Header -->
      <div class="card border-0 shadow-sm p-4 mb-4">
        <h2 class="fw-extrabold text-dark mb-1">Help & Support Center</h2>
        <p class="text-muted small mb-0">Browse answers to frequently asked questions or submit a support query to the administrator.</p>
      </div>

      <div class="row g-4">
        <!-- FAQ Accordion section -->
        <div class="col-lg-7">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-4 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-question-circle text-primary"></i> Frequently Asked Questions
              </h5>

              <div class="faq-list d-flex flex-column gap-3">
                <div *ngFor="let faq of faqs; let i = index" class="faq-item border rounded-3 p-3 transition-all" [class.border-primary]="faq.open">
                  <div class="d-flex align-items-center justify-content-between cursor-pointer" (click)="toggleFaq(i)" style="cursor: pointer;">
                    <h6 class="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <span class="text-primary fw-bold">Q.</span> {{ faq.question }}
                    </h6>
                    <i class="bi fs-5 text-muted" [ngClass]="faq.open ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                  </div>
                  <div *ngIf="faq.open" class="mt-3 text-muted small pt-2 border-top border-light-subtle transition-all">
                    {{ faq.answer }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Support form -->
        <div class="col-lg-5">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-chat-left-text text-success"></i> Submit Support Request
              </h5>
              <p class="text-muted small mb-4">Got issues? Describe your issue below and our administration desk will get back to you shortly.</p>

              <form [formGroup]="supportForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="form-floating mb-3">
                  <input type="text" id="name" formControlName="name" class="form-control" [class.is-invalid]="isFieldInvalid('name')" placeholder="Name" />
                  <label for="name">Your Name <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Name is required.</div>
                </div>

                <!-- Email -->
                <div class="form-floating mb-3">
                  <input type="email" id="email" formControlName="email" class="form-control" [class.is-invalid]="isFieldInvalid('email')" placeholder="Email" />
                  <label for="email">Email Address <span class="text-danger">*</span></label>
                  <div class="invalid-feedback">Please enter a valid email.</div>
                </div>

                <!-- Query message -->
                <div class="mb-4">
                  <label for="message" class="form-label text-muted small fw-semibold">Describe your issue <span class="text-danger">*</span></label>
                  <textarea id="message" formControlName="message" class="form-control" rows="4" [class.is-invalid]="isFieldInvalid('message')" placeholder="Detail your issue..."></textarea>
                  <div class="invalid-feedback">Please describe your query.</div>
                </div>

                <!-- Submit Button -->
                <button type="submit" [disabled]="submitting" class="btn btn-primary w-100 py-2.5 rounded-3 d-flex align-items-center justify-content-center gap-2">
                  <span *ngIf="submitting" class="spinner-border spinner-border-sm" role="status"></span>
                  <i class="bi bi-send-fill" *ngIf="!submitting"></i> Send Support Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faq-item {
      background-color: #ffffff;
      transition: all 0.25s ease;
    }
    .faq-item:hover {
      background-color: #f8fafc;
    }
  `]
})
export class HelpComponent implements OnInit {
  supportForm!: FormGroup;
  submitting = false;

  faqs: FAQ[] = [
    {
      question: 'How do I register for an event?',
      answer: 'Navigate to the "Explore Events" catalog tab on the sidebar. Choose the event you wish to register for, click the "Register" button, review your booking details, and click "Confirm Registration". Your ticket will instantly show up in the "My Registrations" list.',
      open: true
    },
    {
      question: 'Can I cancel my event registration?',
      answer: 'Yes! Navigate to the "My Registrations" list, locate the event booking you wish to drop, and click the "Cancel" button. Once confirmed, your seat status will update to "Cancelled" and the ticket releases capacity back to the event pool.',
      open: false
    },
    {
      question: 'Who can create new events?',
      answer: 'Only accounts designated with the ADMIN role can create, update, or delete events, or view the complete participants database logs.',
      open: false
    },
    {
      question: 'How do I download a registrations report?',
      answer: 'Administrators can download registration statistics as spreadsheet files by clicking the "Export CSV" button in the upper right of the Registrations List page.',
      open: false
    }
  ];

  constructor(
    private fb: FormBuilder,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.supportForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required]]
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.supportForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onSubmit() {
    if (this.supportForm.invalid) {
      this.supportForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    setTimeout(() => {
      this.notification.showSuccess('Support ticket submitted successfully! We will contact you soon.');
      this.supportForm.reset();
      this.submitting = false;
    }, 1200);
  }
}
