import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { Registration } from '../../models/registration.model';
import { Status } from '../../models/status.enum';

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-2">
      <!-- Title & CTA Header -->
      <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="row align-items-center g-3">
          <div class="col-md-6">
            <h2 class="fw-extrabold text-dark mb-1">
              {{ currentRole === 'ADMIN' ? 'Registrations Directory' : 'My Bookings Directory' }}
            </h2>
            <p class="text-muted small mb-0">
              {{ currentRole === 'ADMIN' ? 'Track attendee check-ins, approve bookings, or cancel inactive slots.' : 'Check details and statuses of your booked events.' }}
            </p>
          </div>
          <div class="col-md-6 text-md-end d-flex gap-2 justify-content-md-end" *ngIf="currentRole === 'ADMIN'">
            <!-- Export CSV -->
            <button (click)="exportToCSV()" class="btn btn-outline-primary d-flex align-items-center gap-2 border-light-subtle">
              <i class="bi bi-download"></i> Export CSV
            </button>
          </div>
        </div>

        <div class="row mt-3 g-2 align-items-center">
          <!-- Search input -->
          <div class="col-lg-6 position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              class="form-control ps-5 rounded-3 py-2 border-light-subtle"
              placeholder="Search by participant name, email, or event name..."
              [(ngModel)]="searchQuery"
              (input)="filterRegistrations()"
            />
          </div>
          <!-- Status Dropdown filter with Table/Card Toggle -->
          <div class="col-lg-4 ms-auto d-flex gap-2 align-items-center justify-content-end">
            <select
              [(ngModel)]="selectedStatusFilter"
              (change)="filterRegistrations()"
              class="form-select border-light-subtle py-2 flex-grow-1"
              style="max-width: 200px;"
            >
              <option value="all">Status: All Bookings</option>
              <option [value]="Status.REGISTERED">Status: Confirmed</option>
              <option [value]="Status.CANCELLED">Status: Cancelled</option>
            </select>
            
            <div class="btn-group border border-light-subtle rounded-3 p-1 bg-light">
              <button type="button" class="btn btn-sm rounded-2 py-1 px-2 border-0" 
                      [class.btn-primary]="isTableView" 
                      [class.text-muted]="!isTableView" 
                      (click)="isTableView = true" title="Table View">
                <i class="bi bi-table"></i>
              </button>
              <button type="button" class="btn btn-sm rounded-2 py-1 px-2 border-0" 
                      [class.btn-primary]="!isTableView" 
                      [class.text-muted]="isTableView" 
                      (click)="isTableView = false" title="Grid View">
                <i class="bi bi-grid-fill"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="card border-0 shadow-sm p-5 text-center my-4">
        <div class="spinner-border text-primary my-2" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted mt-2 mb-0">Synchronizing registries...</p>
      </div>

      <!-- Content Grid -->
      <div *ngIf="!loading">
        <!-- Empty State -->
        <div *ngIf="filteredRegistrations.length === 0" class="card border-0 shadow-sm p-5 text-center my-4">
          <div class="empty-state-svg mx-auto mb-4 text-muted">
            <i class="bi bi-ticket-perforated display-3"></i>
          </div>
          <h4 class="fw-bold text-dark mb-1">No registrations found</h4>
          <p class="text-muted small mb-3">No matching registration records are available in the directory.</p>
          <button (click)="resetFilters()" class="btn btn-outline-primary btn-sm px-4 rounded-pill">Reset Filter</button>
        </div>

        <!-- Rounded Table grid view -->
        <div *ngIf="filteredRegistrations.length > 0 && isTableView" class="card border-0 shadow-sm overflow-hidden mb-4">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0 rounded-table border border-light-subtle">
              <thead class="bg-light-subtle text-muted text-uppercase small" style="font-size: 0.75rem;">
                <tr>
                  <th scope="col" class="ps-4 py-3">Booking ID</th>
                  <th scope="col" class="py-3">Participant Details</th>
                  <th scope="col" class="py-3">Event Details</th>
                  <th scope="col" class="py-3">Date Registered</th>
                  <th scope="col" class="py-3">Status</th>
                  <th scope="col" class="pe-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let reg of filteredRegistrations" class="transition-all">
                  <!-- Reg ID -->
                  <td class="ps-4 fw-bold text-muted">#{{ reg.registrationId }}</td>
                  
                  <!-- Participant User Details -->
                  <td>
                    <div class="d-flex align-items-center">
                      <div class="avatar bg-primary-subtle text-primary fw-bold me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px; font-size: 0.9rem;">
                        {{ getInitials(reg.user?.name) }}
                      </div>
                      <div>
                        <h6 class="fw-bold mb-0 text-body" style="font-size: 0.9rem;">{{ reg.user?.name || 'N/A' }}</h6>
                        <span class="text-muted small d-block">{{ reg.user?.email || 'N/A' }}</span>
                      </div>
                    </div>
                  </td>
                  
                  <!-- Event Details -->
                  <td>
                    <span class="fw-bold text-body d-block" style="font-size: 0.9rem;">{{ reg.event.eventName }}</span>
                    <span class="text-muted small d-flex align-items-center gap-1">
                      <i class="bi bi-calendar-event text-primary"></i> {{ reg.event.eventDate }}
                    </span>
                  </td>
                  
                  <!-- Date Registered -->
                  <td class="text-muted small">
                    {{ reg.registrationDate | date:'medium' }}
                  </td>
                  
                  <!-- Status -->
                  <td>
                    <span class="status-badge" 
                          [ngClass]="reg.status === Status.REGISTERED ? 'status-badge-success' : 'status-badge-danger'">
                      <span class="status-dot bg-current"></span>
                      {{ reg.status === Status.REGISTERED ? 'Confirmed' : 'Cancelled' }}
                    </span>
                  </td>
                  
                  <!-- Action Buttons -->
                  <td class="pe-4 text-end">
                    <div class="d-flex gap-2 justify-content-end">
                      <button
                        *ngIf="reg.status === Status.REGISTERED"
                        (click)="triggerCancelModal(reg)"
                        class="btn btn-outline-warning btn-sm rounded-3 py-1.5 px-3 d-inline-flex align-items-center gap-1"
                        title="Cancel Registration"
                      >
                        <i class="bi bi-x-circle"></i> Cancel
                      </button>
                      
                      <button
                        *ngIf="currentRole === 'ADMIN'"
                        (click)="triggerDeleteModal(reg.registrationId!)"
                        class="btn btn-outline-danger btn-sm rounded-3 py-1.5 px-2.5 d-inline-flex align-items-center justify-content-center"
                        title="Delete Registration"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Registration Cards Grid View -->
        <div *ngIf="filteredRegistrations.length > 0 && !isTableView" class="row g-4 mb-4">
          <div class="col-md-6 col-xl-4" *ngFor="let reg of filteredRegistrations">
            <div class="card border-0 shadow-sm hover-lift h-100 position-relative p-3">
              <div class="accent-line" [ngClass]="reg.status === Status.REGISTERED ? 'bg-success' : 'bg-danger'"></div>
              <div class="card-body p-1 d-flex flex-column justify-content-between h-100">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-3">
                    <span class="fw-bold text-muted" style="font-size: 0.8rem;">#{{ reg.registrationId }}</span>
                    <span class="status-badge" 
                          [ngClass]="reg.status === Status.REGISTERED ? 'status-badge-success' : 'status-badge-danger'">
                      <span class="status-dot bg-current"></span>
                      {{ reg.status === Status.REGISTERED ? 'Confirmed' : 'Cancelled' }}
                    </span>
                  </div>
                  
                  <h5 class="fw-bold text-dark mb-1 text-truncate">{{ reg.event.eventName }}</h5>
                  <span class="text-muted small d-block mb-3"><i class="bi bi-calendar-event me-1"></i> {{ reg.event.eventDate }}</span>

                  <div class="d-flex align-items-center border-top pt-3 mb-3">
                    <div class="avatar bg-primary-subtle text-primary fw-bold me-2.5 rounded-circle d-flex align-items-center justify-content-center" style="width: 36px; height: 36px; font-size: 0.8rem;">
                      {{ getInitials(reg.user?.name) }}
                    </div>
                    <div class="min-width-0">
                      <h6 class="fw-semibold mb-0 text-body text-truncate" style="font-size: 0.85rem; max-width: 180px;">{{ reg.user?.name || 'N/A' }}</h6>
                      <span class="text-muted small d-block text-truncate" style="max-width: 180px;">{{ reg.user?.email || 'N/A' }}</span>
                    </div>
                  </div>
                </div>

                <div class="d-flex gap-2 justify-content-end border-top pt-3">
                  <button
                    *ngIf="reg.status === Status.REGISTERED"
                    (click)="triggerCancelModal(reg)"
                    class="btn btn-outline-warning btn-sm rounded-3 py-1 px-3 d-inline-flex align-items-center gap-1"
                  >
                    <i class="bi bi-x-circle"></i> Cancel
                  </button>
                  <button
                    *ngIf="currentRole === 'ADMIN'"
                    (click)="triggerDeleteModal(reg.registrationId!)"
                    class="btn btn-outline-danger btn-sm rounded-3 py-1 px-2.5 d-inline-flex align-items-center justify-content-center"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Custom HTML Dialog Modal: Cancel Confirmation -->
      <div *ngIf="showCancelModal" class="custom-modal-backdrop">
        <div class="custom-modal-content p-4">
          <div class="text-center">
            <div class="bg-warning-subtle text-warning rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 54px; height: 54px;">
              <i class="bi bi-exclamation-triangle-fill fs-3"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Cancel Registration?</h4>
            <p class="text-muted small mb-4">
              Are you sure you want to cancel <strong>{{ targetRegistration?.user?.name }}</strong>'s registration for the event <strong>{{ targetRegistration?.event?.eventName }}</strong>? 
              This slot will be released back to the capacity pool.
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-light border flex-grow-1 py-2 rounded-3" (click)="showCancelModal = false">Discard</button>
            <button class="btn btn-warning text-dark fw-bold flex-grow-1 py-2 rounded-3" (click)="confirmCancelRegistration()">Confirm Cancel</button>
          </div>
        </div>
      </div>

      <!-- Custom HTML Dialog Modal: Delete Confirmation -->
      <div *ngIf="showDeleteModal" class="custom-modal-backdrop">
        <div class="custom-modal-content p-4">
          <div class="text-center">
            <div class="bg-danger-subtle text-danger rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 54px; height: 54px;">
              <i class="bi bi-trash-fill fs-3"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">Delete Registry permanently?</h4>
            <p class="text-muted small mb-4">
              Are you sure you want to delete this registration record (#{{ targetDeleteId }}) permanently? This action is irreversible and deletes all associated logs.
            </p>
          </div>
          <div class="d-flex gap-2">
            <button class="btn btn-light border flex-grow-1 py-2 rounded-3" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn btn-danger flex-grow-1 py-2 rounded-3" (click)="confirmDeleteRegistration()">Delete Record</button>
          </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .rounded-table {
      border-collapse: separate !important;
      border-spacing: 0;
      overflow: hidden;
    }
    .rounded-table tr:last-child td:first-child {
      border-bottom-left-radius: 0.75rem;
    }
    .rounded-table tr:last-child td:last-child {
      border-bottom-right-radius: 0.75rem;
    }
    .status-dot {
      display: inline-block;
      width: 6px;
      height: 6px;
      border-radius: 50%;
    }
  `]
})
export class ParticipantListComponent implements OnInit {
  registrations: Registration[] = [];
  filteredRegistrations: Registration[] = [];
  loading = true;
  Status = Status;

  currentRole = 'ADMIN';
  currentUserId = 2;
  isTableView = true;

  searchQuery = '';
  selectedStatusFilter = 'all';

  // Dialog Modals State
  showCancelModal = false;
  showDeleteModal = false;
  targetRegistration: Registration | null = null;
  targetDeleteId: number | null = null;

  constructor(
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentRole = localStorage.getItem('current_role') || 'ADMIN';
    const savedUserId = localStorage.getItem('current_user_id');
    this.currentUserId = savedUserId ? +savedUserId : 2;
    this.loadRegistrations();
  }

  loadRegistrations() {
    this.loading = true;
    this.registrationService.getAll().subscribe({
      next: (data) => {
        const dataList = data || [];
        const sortedData = dataList.sort((a, b) => (b.registrationId || 0) - (a.registrationId || 0));
        
        if (this.currentRole === 'ADMIN') {
          this.registrations = sortedData;
        } else {
          this.registrations = sortedData.filter(r => r && r.user?.userId === this.currentUserId);
        }
        
        this.filterRegistrations();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading registrations', err);
        this.notification.showError('Could not load participant registries.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  filterRegistrations() {
    let result = [...this.registrations];
    const query = this.searchQuery.toLowerCase().trim();

    if (query) {
      result = result.filter(r =>
        (r.user && r.user.name.toLowerCase().includes(query)) ||
        (r.user && r.user.email.toLowerCase().includes(query)) ||
        r.event.eventName.toLowerCase().includes(query)
      );
    }

    if (this.selectedStatusFilter !== 'all') {
      result = result.filter(r => r.status === this.selectedStatusFilter);
    }

    this.filteredRegistrations = result;
  }

  resetFilters() {
    this.searchQuery = '';
    this.selectedStatusFilter = 'all';
    this.filterRegistrations();
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  // Trigger Cancel Dialog
  triggerCancelModal(reg: Registration) {
    this.targetRegistration = reg;
    this.showCancelModal = true;
  }

  confirmCancelRegistration() {
    if (!this.targetRegistration) return;
    this.showCancelModal = false;

    const updatedPayload: Registration = {
      ...this.targetRegistration,
      status: Status.CANCELLED
    };

    this.registrationService.register(updatedPayload).subscribe({
      next: () => {
        this.notification.showSuccess('Registration status cancelled.');
        this.loadRegistrations();
      },
      error: (err) => {
        console.error('Error cancelling registration', err);
        this.notification.showError('Failed to cancel registration.');
      }
    });
  }

  // Trigger Delete Dialog
  triggerDeleteModal(id: number) {
    this.targetDeleteId = id;
    this.showDeleteModal = true;
  }

  confirmDeleteRegistration() {
    if (!this.targetDeleteId) return;
    this.showDeleteModal = false;

    this.registrationService.delete(this.targetDeleteId).subscribe({
      next: () => {
        this.notification.showSuccess('Registration record deleted.');
        this.loadRegistrations();
      },
      error: (err) => {
        console.error('Error deleting registration', err);
        this.notification.showError('Failed to delete registration record.');
      }
    });
  }

  // Export CSV Report
  exportToCSV() {
    const headers = ['Registration ID', 'Participant Name', 'Participant Email', 'Event Name', 'Event Date', 'Status'];
    const csvRows = [headers.join(',')];
    
    this.filteredRegistrations.forEach(r => {
      const row = [
        r.registrationId,
        `"${r.user?.name || ''}"`,
        `"${r.user?.email || ''}"`,
        `"${r.event.eventName}"`,
        r.event.eventDate,
        r.status
      ];
      csvRows.push(row.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `registrations_report_${new Date().toISOString().split('T')[0]}.csv`);
    a.click();
    this.notification.showSuccess('Registrations exported to CSV successfully!');
  }
}
