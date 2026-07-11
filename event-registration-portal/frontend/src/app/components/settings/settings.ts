import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-2">
      <!-- Header -->
      <div class="card border-0 shadow-sm p-4 mb-4">
        <h2 class="fw-extrabold text-dark mb-1">System Settings</h2>
        <p class="text-muted small mb-0">Configure dashboard visuals, notification triggers, and check server status details.</p>
      </div>

      <div class="row g-4">
        <!-- Visual Settings Panel -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-palette text-primary"></i> Interface Customization
              </h5>
              
              <div class="mb-4">
                <label class="form-label text-muted small fw-semibold mb-2">Display Theme</label>
                <div class="d-flex gap-3">
                  <div class="theme-option flex-grow-1 p-3 border rounded-3 text-center cursor-pointer"
                       [class.border-primary]="!isDarkTheme" (click)="toggleTheme(false)" style="cursor: pointer;">
                    <i class="bi bi-sun-fill text-warning fs-3 mb-1 d-block"></i>
                    <span class="fw-semibold small text-dark">Light Mode</span>
                  </div>
                  <div class="theme-option flex-grow-1 p-3 border rounded-3 text-center cursor-pointer"
                       [class.border-primary]="isDarkTheme" (click)="toggleTheme(true)" style="cursor: pointer;">
                    <i class="bi bi-moon-stars-fill text-primary fs-3 mb-1 d-block"></i>
                    <span class="fw-semibold small text-dark">Dark Mode</span>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <div class="form-check form-switch py-1">
                  <input class="form-check-input" type="checkbox" id="compactSidebar" [(ngModel)]="compactSidebar" (change)="saveSettings()" />
                  <label class="form-check-label fw-medium text-dark small" for="compactSidebar">Compact Navigation Sidebar</label>
                </div>
                <span class="text-muted d-block small" style="font-size: 0.75rem; margin-left: 2.5rem;">Compresses left menu labels into icons.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification settings Panel -->
        <div class="col-lg-6">
          <div class="card border-0 shadow-sm h-100">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-bell text-success"></i> Notification Channels
              </h5>

              <div class="mb-3">
                <div class="form-check form-switch py-1">
                  <input class="form-check-input" type="checkbox" id="emailAlerts" [(ngModel)]="emailAlerts" (change)="saveSettings()" />
                  <label class="form-check-label fw-medium text-dark small" for="emailAlerts">Enable Email Confirmations</label>
                </div>
                <span class="text-muted d-block small" style="font-size: 0.75rem; margin-left: 2.5rem;">Sends booking receipts and agendas automatically.</span>
              </div>

              <div class="mb-3">
                <div class="form-check form-switch py-1">
                  <input class="form-check-input" type="checkbox" id="capacityAlerts" [(ngModel)]="capacityAlerts" (change)="saveSettings()" />
                  <label class="form-check-label fw-medium text-dark small" for="capacityAlerts">Event Capacity Threshold Alerts</label>
                </div>
                <span class="text-muted d-block small" style="font-size: 0.75rem; margin-left: 2.5rem;">Triggers warning alerts once events hit 90% booking rates.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Server Status panel -->
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-body p-4">
              <h5 class="fw-bold text-dark mb-3 border-bottom pb-2 d-flex align-items-center gap-2">
                <i class="bi bi-cpu text-info"></i> Server Diagnostics
              </h5>

              <div class="row g-4">
                <div class="col-md-3">
                  <span class="text-muted small d-block">Spring Boot Registry</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 mt-1 d-inline-flex align-items-center gap-1">
                    <span class="dot bg-success"></span> Online (Active)
                  </span>
                </div>
                <div class="col-md-3">
                  <span class="text-muted small d-block">MySQL Connection</span>
                  <span class="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1.5 mt-1 d-inline-flex align-items-center gap-1">
                    <span class="dot bg-success"></span> Connected (Port 3306)
                  </span>
                </div>
                <div class="col-md-3">
                  <span class="text-muted small d-block">Client Build version</span>
                  <span class="fw-semibold text-dark d-block mt-1">Angular v21.0.5</span>
                </div>
                <div class="col-md-3">
                  <span class="text-muted small d-block">Security Status</span>
                  <span class="fw-semibold text-success d-block mt-1">SSL Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .theme-option {
      transition: all 0.2s ease;
    }
    .theme-option:hover {
      background-color: #f8fafc;
    }
    .dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  `]
})
export class SettingsComponent implements OnInit {
  isDarkTheme = false;
  compactSidebar = false;
  emailAlerts = true;
  capacityAlerts = true;

  constructor(private notification: NotificationService) {}

  ngOnInit(): void {
    this.isDarkTheme = document.body.classList.contains('dark-theme');
    this.compactSidebar = localStorage.getItem('compact_sidebar') === 'true';
    this.emailAlerts = localStorage.getItem('email_alerts') !== 'false';
    this.capacityAlerts = localStorage.getItem('capacity_alerts') !== 'false';
  }

  toggleTheme(dark: boolean) {
    this.isDarkTheme = dark;
    if (dark) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('dark_theme', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('dark_theme', 'false');
    }
    this.notification.showSuccess(`Theme successfully changed!`);
  }

  saveSettings() {
    localStorage.setItem('compact_sidebar', String(this.compactSidebar));
    localStorage.setItem('email_alerts', String(this.emailAlerts));
    localStorage.setItem('capacity_alerts', String(this.capacityAlerts));
    this.notification.showSuccess('Settings synced successfully.');
  }
}
