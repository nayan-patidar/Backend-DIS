import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="container-fluid py-2">
      <!-- Title & Search Header -->
      <div class="card border-0 shadow-sm p-4 mb-4">
        <div class="row align-items-center g-3">
          <div class="col-md-6">
            <h2 class="fw-extrabold text-dark mb-1">Users Directory</h2>
            <p class="text-muted small mb-0">Review registered accounts, check roles, and monitor join dates.</p>
          </div>
        </div>

        <div class="row mt-3 g-2 align-items-center">
          <div class="col-lg-6 position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              class="form-control ps-5 rounded-3 py-2 border-light-subtle"
              placeholder="Search by name or email..."
              [(ngModel)]="searchQuery"
              (input)="filterUsers()"
            />
          </div>
          <div class="col-lg-3 ms-auto">
            <select class="form-select border-light-subtle py-2" [(ngModel)]="roleFilter" (change)="filterUsers()">
              <option value="all">Role: All Accounts</option>
              <option value="ADMIN">Role: Administrators</option>
              <option value="PARTICIPANT">Role: Participants</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-4">
        <div class="col-md-6">
          <div class="card border-0 shadow-sm p-3 position-relative overflow-hidden">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
                <i class="bi bi-shield-lock-fill fs-5"></i>
              </div>
              <div>
                <h6 class="text-muted text-uppercase small mb-1">Administrators</h6>
                <h4 class="fw-bold mb-0 text-dark">{{ totalAdmins }}</h4>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card border-0 shadow-sm p-3 position-relative overflow-hidden">
            <div class="d-flex align-items-center gap-3">
              <div class="avatar bg-info-subtle text-info fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 44px; height: 44px;">
                <i class="bi bi-people-fill fs-5"></i>
              </div>
              <div>
                <h6 class="text-muted text-uppercase small mb-1">Participants</h6>
                <h4 class="fw-bold mb-0 text-dark">{{ totalParticipants }}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Users Grid/Table -->
      <div class="card border-0 shadow-sm overflow-hidden mb-4">
        <div class="table-responsive" *ngIf="filteredUsers.length > 0">
          <table class="table table-hover align-middle mb-0 rounded-table border border-light-subtle">
            <thead class="bg-light-subtle text-muted text-uppercase small" style="font-size: 0.75rem;">
              <tr>
                <th scope="col" class="ps-4 py-3">User ID</th>
                <th scope="col" class="py-3">Profile Account</th>
                <th scope="col" class="py-3">Phone Number</th>
                <th scope="col" class="py-3">Role</th>
                <th scope="col" class="pe-4 py-3 text-end">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let usr of filteredUsers">
                <td class="ps-4 fw-bold text-muted">#{{ usr.userId }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="avatar bg-primary-subtle text-primary fw-bold me-3 rounded-circle d-flex align-items-center justify-content-center" style="width: 38px; height: 38px; font-size: 0.85rem;">
                      {{ getInitials(usr.name) }}
                    </div>
                    <div>
                      <h6 class="fw-bold mb-0 text-dark" style="font-size: 0.9rem;">{{ usr.name }}</h6>
                      <span class="text-muted small">{{ usr.email }}</span>
                    </div>
                  </div>
                </td>
                <td class="text-muted small">
                  {{ usr.phone || 'Not provided' }}
                </td>
                <td>
                  <span class="badge rounded-pill px-2.5 py-1.5 fw-semibold border text-uppercase"
                        [ngClass]="{
                          'bg-primary-subtle text-primary border-primary-subtle': usr.role === 'ADMIN',
                          'bg-info-subtle text-info border-info-subtle': usr.role === 'PARTICIPANT'
                        }" style="font-size: 0.7rem;">
                    {{ usr.role }}
                  </span>
                </td>
                <td class="pe-4 text-end">
                  <a [routerLink]="['/register-participant']" class="btn btn-light btn-sm rounded-3 py-1 px-2.5 border" style="font-size: 0.75rem;">
                    Book Event
                  </a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div class="p-5 text-center" *ngIf="filteredUsers.length === 0">
          <i class="bi bi-people text-muted display-4 mb-3 d-block"></i>
          <h5 class="fw-bold text-dark">No accounts found</h5>
          <p class="text-muted small">No users match your keyword or role query.</p>
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
  `]
})
export class UserListComponent implements OnInit {
  allUsers: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  roleFilter = 'all';

  totalAdmins = 0;
  totalParticipants = 0;

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.allUsers = data || [];
        this.totalAdmins = this.allUsers.filter(u => u.role === 'ADMIN').length;
        this.totalParticipants = this.allUsers.filter(u => u.role === 'PARTICIPANT').length;
        this.filterUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users catalog', err);
      }
    });
  }

  filterUsers() {
    let result = [...this.allUsers];
    const q = this.searchQuery.toLowerCase().trim();

    if (q) {
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }

    if (this.roleFilter !== 'all') {
      result = result.filter(u => u.role === this.roleFilter);
    }

    this.filteredUsers = result;
  }

  getInitials(name?: string): string {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
}
