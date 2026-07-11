import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { timeout } from 'rxjs/operators';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { Role } from '../../models/role.enum';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper d-flex align-items-center justify-content-center min-vh-100 position-relative overflow-hidden" style="background-color: var(--bg-app);">
      <div class="card auth-card border shadow-sm position-relative overflow-hidden z-2 bg-white" style="width: 440px;">
        
        <div class="card-body p-4 p-md-5 bg-white text-dark">
          <!-- Logo & Header -->
          <div class="text-center mb-4">
            <div class="d-inline-flex align-items-center justify-content-center text-white rounded-3 mb-3 shadow-sm bg-primary" style="width: 56px; height: 56px;">
              <i class="bi bi-star-fill fs-3"></i>
            </div>
            <h3 class="fw-bolder text-dark mb-1">Welcome Back</h3>
            <p class="text-muted small">Please sign in to your account</p>
          </div>

          <!-- Slide Tabs -->
          <div class="d-flex gap-2 p-1 bg-light border rounded-3 mb-4 shadow-sm">
            <button type="button" class="btn btn-sm flex-grow-1 py-2 fw-semibold text-muted"
                    [ngClass]="activeTab === 'login' ? 'bg-white shadow-sm text-dark' : ''"
                    (click)="switchTab('login')">Login</button>
            <button type="button" class="btn btn-sm flex-grow-1 py-2 fw-semibold text-muted"
                    [ngClass]="activeTab === 'signup' ? 'bg-white shadow-sm text-dark' : ''"
                    (click)="switchTab('signup')">Sign Up</button>
          </div>

          <!-- Login Form -->
          <form *ngIf="activeTab === 'login'" [formGroup]="loginForm" (ngSubmit)="onLoginSubmit()">
            <div class="mb-3">
              <label for="loginEmail" class="form-label text-muted small fw-semibold mb-1">Email Address</label>
              <input type="email" id="loginEmail" formControlName="email" class="form-control" placeholder="admin@gmail.com / user@example.com" [class.is-invalid]="isLoginFieldInvalid('email')" autocomplete="off" />
              <div class="invalid-feedback" *ngIf="isLoginFieldInvalid('email')">Please enter a valid email address.</div>
            </div>

            <div class="mb-4">
              <label for="loginPassword" class="form-label text-muted small fw-semibold mb-1">Password</label>
              <input type="password" id="loginPassword" formControlName="password" class="form-control" placeholder="••••••••" [class.is-invalid]="isLoginFieldInvalid('password')" autocomplete="new-password" />
              <div class="invalid-feedback" *ngIf="isLoginFieldInvalid('password')">Password must be at least 6 characters.</div>
            </div>

            <button type="submit" [disabled]="submitting" class="btn btn-primary w-100 py-2 mb-3 fw-semibold shadow-sm hover-lift">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Sign In
            </button>
          </form>

          <!-- Signup Form -->
          <form *ngIf="activeTab === 'signup'" [formGroup]="signupForm" (ngSubmit)="onSignupSubmit()">
            <div class="mb-3">
              <label for="signupName" class="form-label text-muted small fw-semibold mb-1">Full Name</label>
              <input type="text" id="signupName" formControlName="name" class="form-control" placeholder="Rahul Sharma" [class.is-invalid]="isSignupFieldInvalid('name')" autocomplete="off" />
              <div class="invalid-feedback" *ngIf="isSignupFieldInvalid('name')">Name is required.</div>
            </div>

            <div class="mb-3">
              <label for="signupEmail" class="form-label text-muted small fw-semibold mb-1">Email Address</label>
              <input type="email" id="signupEmail" formControlName="email" class="form-control" placeholder="rahul@gmail.com" [class.is-invalid]="isSignupFieldInvalid('email')" autocomplete="off" />
              <div class="invalid-feedback" *ngIf="isSignupFieldInvalid('email')">Valid email required.</div>
            </div>

            <div class="mb-3">
              <label for="signupPhone" class="form-label text-muted small fw-semibold mb-1">Phone Number</label>
              <input type="text" id="signupPhone" formControlName="phone" class="form-control" placeholder="9876543210" [class.is-invalid]="isSignupFieldInvalid('phone')" autocomplete="off" />
              <div class="invalid-feedback" *ngIf="isSignupFieldInvalid('phone')">Valid 10-digit phone number is required.</div>
            </div>

            <div class="mb-4">
              <label for="signupPassword" class="form-label text-muted small fw-semibold mb-1">Password</label>
              <input type="password" id="signupPassword" formControlName="password" class="form-control" placeholder="••••••••" [class.is-invalid]="isSignupFieldInvalid('password')" autocomplete="new-password" />
              <div class="invalid-feedback" *ngIf="isSignupFieldInvalid('password')">Password must be at least 6 characters.</div>
            </div>

            <button type="submit" [disabled]="submitting" class="btn btn-primary w-100 py-2 mb-3 fw-semibold shadow-sm hover-lift">
              <span *ngIf="submitting" class="spinner-border spinner-border-sm me-1" role="status"></span>
              Create Account
            </button>
          </form>

          <!-- Demo Accounts Tip -->
          <div class="p-3 bg-light border rounded-3 text-center small">
            <span class="text-primary fw-semibold"><i class="bi bi-info-circle me-1"></i> Demo Credentials</span>
            <div class="text-muted mt-2">
              <strong>Admin:</strong> admin@gmail.com / admin123<br/>
              <strong>User:</strong> rahul@gmail.com / rahul123
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`

  `]
})
export class AuthComponent implements OnInit {
  activeTab: 'login' | 'signup' = 'login';
  loginForm!: FormGroup;
  signupForm!: FormGroup;
  submitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    // Read query tab parameter
    const tabParam = this.route.snapshot.queryParams['tab'];
    if (tabParam === 'signup' || tabParam === 'login') {
      this.activeTab = tabParam;
    }

    // If user is already logged in, route to dashboard
    if (localStorage.getItem('current_user_id')) {
      this.router.navigate(['/dashboard']);
    }
    this.initForms();
  }

  private initForms() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  switchTab(tab: 'login' | 'signup') {
    this.activeTab = tab;
  }

  isLoginFieldInvalid(field: string): boolean {
    const ctrl = this.loginForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  isSignupFieldInvalid(field: string): boolean {
    const ctrl = this.signupForm.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  onLoginSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const { email, password } = this.loginForm.value;

    const emailLower = (email || '').toLowerCase().trim();
    const pass = (password || '').trim();

    // INTERCEPT 1: Check if they created a local offline account
    const mockUsersStr = localStorage.getItem('mock_users');
    const mockUsers: any[] = mockUsersStr ? JSON.parse(mockUsersStr) : [];
    const foundMockUser = mockUsers.find(u => (u.email || '').toLowerCase().trim() === emailLower && u.password === pass);
    
    if (foundMockUser) {
      this.notification.showInfo('Logged in instantly with your custom offline account.');
      this.loginSuccess(foundMockUser);
      return;
    }

    // INTERCEPT 2: If using demo credentials, log in instantly without waiting for a backend timeout!
    if (emailLower.includes('admin') && pass === 'admin123') {
      this.notification.showInfo('Logged in instantly with Admin demo account.');
      this.loginSuccess({ userId: 1, name: 'System Admin', email: 'admin@gmail.com', role: Role.ADMIN });
      return;
    } else if (emailLower.includes('rahul') && pass === 'rahul123') {
      this.notification.showInfo('Logged in instantly with User demo account.');
      this.loginSuccess({ userId: 2, name: 'Rahul Sharma', email: 'rahul@gmail.com', role: Role.PARTICIPANT });
      return;
    }

    this.userService.getAllUsers().pipe(timeout(3000)).subscribe({
      next: (usersList: User[]) => {
        const list = usersList || [];
        const user = list.find((u: User) => u.email?.toLowerCase().trim() === emailLower && u.password === pass);
        
        if (user) {
          this.loginSuccess(user);
        } else {
          this.notification.showError('Invalid email or password.');
          this.submitting = false;
        }
      },
      error: (err) => {
        console.error('Error fetching users during authentication', err);
        this.notification.showError('Invalid email or password. (Make sure Backend is running)');
        this.submitting = false;
      }
    });
  }

  private loginSuccess(user: any) {
    localStorage.setItem('current_user_id', String(user.userId));
    localStorage.setItem('current_role', user.role === Role.ADMIN ? 'ADMIN' : 'PARTICIPANT');
    const tokenPayload = { userId: user.userId, email: user.email, role: user.role };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify(tokenPayload)) + '.mock_signature';
    localStorage.setItem('auth_token', mockToken);
    
    this.notification.showSuccess(`Welcome back, ${user.name}!`);
    this.router.navigate(['/dashboard']);
  }

  onSignupSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.submitting = true;
    const formVal = this.signupForm.value;

    const emailStr = formVal.email.toLowerCase().trim();
    const isSpecialAdmin = emailStr === 'admin@gmail.com' || emailStr.includes('admin');
    const assignedRole = isSpecialAdmin ? Role.ADMIN : Role.PARTICIPANT;

    const newUser: User = {
      name: formVal.name,
      email: formVal.email,
      phone: formVal.phone || null,
      password: formVal.password,
      role: assignedRole,
      createdAt: new Date().toISOString().split('.')[0]
    };

    this.userService.register(newUser).pipe(timeout(3000)).subscribe({
      next: (savedUser) => {
        this.signupSuccess(savedUser, assignedRole);
      },
      error: (err) => {
        console.error('Error creating user profile during signup', err);
        this.notification.showInfo('Backend offline. Account created locally for offline demo.');
        const mockUser = { ...newUser, userId: Math.floor(Math.random() * 1000) + 10 };
        
        // Save to local offline database
        const mockUsersStr = localStorage.getItem('mock_users');
        const mockUsers: any[] = mockUsersStr ? JSON.parse(mockUsersStr) : [];
        mockUsers.push(mockUser);
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));

        this.signupSuccess(mockUser, assignedRole);
      }
    });
  }
  
  private signupSuccess(savedUser: any, assignedRole: Role) {
    localStorage.setItem('current_user_id', String(savedUser.userId));
    localStorage.setItem('current_role', assignedRole);
    const tokenPayload = { userId: savedUser.userId, email: savedUser.email, role: assignedRole };
    const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' + btoa(JSON.stringify(tokenPayload)) + '.mock_signature';
    localStorage.setItem('auth_token', mockToken);

    this.notification.showSuccess(`Account initialized! Welcome, ${savedUser.name}!`);
    this.router.navigate(['/']);
  }
}
