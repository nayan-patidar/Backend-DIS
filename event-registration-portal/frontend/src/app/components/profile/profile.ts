import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-2">
      <!-- Header -->
      <div class="card border-0 shadow-sm p-4 mb-4">
        <h2 class="fw-extrabold text-dark mb-1">My Profile Settings</h2>
        <p class="text-muted small mb-0">Update your account name, email address, phone contact details, and secure your credentials.</p>
      </div>

      <div class="row g-4" *ngIf="!loading">
        <!-- Profile summary card -->
        <div class="col-lg-4">
          <div class="card border-0 shadow-sm text-center p-4">
            <div class="profile-circle bg-primary-subtle text-primary fw-bold mx-auto mb-3 d-flex align-items-center justify-content-center border" 
                 style="width: 80px; height: 80px; font-size: 2rem; border-radius: 50%;">
              {{ getInitials(currentUser?.name) }}
            </div>
            <h5 class="fw-bold text-dark mb-1">{{ currentUser?.name }}</h5>
            <span class="badge rounded-pill bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 text-xs text-uppercase mb-3">
              {{ currentUser?.role }}
            </span>
            <p class="text-muted small mb-0">Joined: {{ currentUser?.createdAt | date:'mediumDate' }}</p>
          </div>
        </div>

        <!-- Profile edit form -->
        <div class="col-lg-8">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4 p-md-5">
              <h5 class="fw-bold text-dark mb-4 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-person-fill text-primary"></i> Personal Details
              </h5>

              <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
                <!-- Name -->
                <div class="form-floating mb-3">
                  <input type="text" id="name" formControlName="name" class="form-control" [class.is-invalid]="isFieldInvalid('name')" placeholder="Name" />
                  <label for="name">Full Name <span class="text-danger">*</span></label>
                  <div class="text-danger mt-1 text-sm fw-medium" *ngIf="isFieldInvalid('name')">Full name is required.</div>
                </div>

                <!-- Email -->
                <div class="form-floating mb-3">
                  <input type="email" id="email" formControlName="email" class="form-control" [class.is-invalid]="isFieldInvalid('email')" placeholder="Email" />
                  <label for="email">Email Address <span class="text-danger">*</span></label>
                  <div class="text-danger mt-1 text-sm fw-medium" *ngIf="isFieldInvalid('email')">Please provide a valid email.</div>
                </div>

                <!-- Phone -->
                <div class="form-floating mb-3">
                  <input type="tel" id="phone" formControlName="phone" class="form-control" placeholder="Phone" />
                  <label for="phone">Phone Number</label>
                </div>

                <!-- Role display (Read only) -->
                <div class="form-floating mb-4">
                  <input type="text" class="form-control bg-light" [value]="currentUser?.role" disabled />
                  <label>Account Role (Read-only)</label>
                </div>

                <!-- Action Button -->
                <div class="d-flex justify-content-end gap-2 border-top pt-4 mt-4">
                  <button type="submit" [disabled]="saving" class="btn btn-primary px-4 py-2 rounded-3">
                    <span *ngIf="saving" class="spinner-border spinner-border-sm me-1" role="status"></span>
                    Save Profile Changes
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
    .profile-circle {
      background: linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%) !important;
    }
  `]
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const savedUserId = localStorage.getItem('current_user_id') || '2';
    
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.currentUser = users.find(u => u.userId === +savedUserId) || users[0];
        this.initForm();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching profile', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  initForm() {
    this.profileForm = this.fb.group({
      name: [this.currentUser?.name || '', [Validators.required]],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      phone: [this.currentUser?.phone || '']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
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
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving = true;
    const formValue = this.profileForm.value;

    const updatedUser: User = {
      ...this.currentUser!,
      name: formValue.name,
      email: formValue.email,
      phone: formValue.phone || null
    };

    this.userService.register(updatedUser).subscribe({
      next: (savedUser) => {
        this.notification.showSuccess('Profile updated successfully!');
        this.currentUser = savedUser;
        
        // Update user cache details in layout
        const savedRole = localStorage.getItem('current_role');
        if (savedRole === 'PARTICIPANT' || String(savedUser.userId) === localStorage.getItem('current_user_id')) {
          // If we updated the active logged-in profile, refresh app layout references
          localStorage.setItem('current_user_id', String(savedUser.userId));
        }

        this.saving = false;
        this.cdr.detectChanges();
        
        // Trigger a reload to sync profile names across layout
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      },
      error: (err) => {
        console.error('Error saving profile changes', err);
        this.notification.showError('Email may already be in use or connection failed.');
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }
}
