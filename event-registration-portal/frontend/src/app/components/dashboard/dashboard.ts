import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { Event } from '../../models/event.model';
import { User } from '../../models/user.model';
import { Registration } from '../../models/registration.model';

interface CalendarDay {
  dayNumber: number | null;
  hasEvent: boolean;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid py-2">
      <!-- Premium Hero Header -->
      <div class="card border-0 bg-dark text-white mb-4 overflow-hidden position-relative shadow-sm hero-banner">
        <div class="card-body p-4 p-md-5 z-2 position-relative">
          <div class="row align-items-center">
            <div class="col-lg-8">
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle mb-3 px-3 py-2 text-uppercase fw-semibold" style="font-size: 0.75rem; letter-spacing: 0.5px;">
                {{ currentRole === 'ADMIN' ? 'Admin Dashboard' : 'Participant Workspace' }}
              </span>
              <h1 class="display-5 fw-extrabold mb-2 text-white">
                {{ currentRole === 'ADMIN' ? 'Welcome back, Administrator' : 'Hello, ' + currentUserName }}
              </h1>
              <p class="text-white-50 mb-0 fs-5 fw-light">
                {{ currentRole === 'ADMIN' 
                  ? 'Monitor system metrics, review registrations, and schedule events from a centralized workspace.' 
                  : 'Browse event opportunities, track your active tickets, and manage registrations.' 
                }}
              </p>
            </div>
            <div class="col-lg-4 text-lg-end mt-4 mt-lg-0">
              <span class="d-inline-flex align-items-center gap-2 bg-white-10 border border-white-10 p-2-5 rounded-pill shadow-sm" style="font-size: 0.875rem;">
                <i class="bi bi-clock-fill text-primary"></i>
                <span class="fw-semibold">{{ today | date:'mediumDate' }}</span>
                <span class="text-white-50">|</span>
                <span class="text-white-50">{{ today | date:'shortTime' }}</span>
              </span>
            </div>
          </div>
        </div>
        <!-- Decorative Background Gradients -->
        <div class="hero-gradient-orb bg-primary"></div>
        <div class="hero-gradient-orb bg-secondary" style="top: -50px; right: -50px; opacity: 0.15; width: 300px; height: 300px;"></div>
      </div>

      <!-- Loading State -->
      <div class="card border-0 shadow-sm p-5 text-center my-4" *ngIf="loading">
        <div class="spinner-border text-primary my-3" style="width: 3.5rem; height: 3.5rem;" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="fw-semibold text-dark mt-3">Analyzing databases...</h5>
        <p class="text-muted small mb-0">Retrieving metrics configured for your role views.</p>
      </div>

      <!-- Main Dashboard Content Grid -->
      <div *ngIf="!loading">
        <!-- Stats Metrics Grid -->
        <div class="row g-4 mb-4">
          <!-- Total Events Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden stat-card stat-card-indigo">
              <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="stat-icon-wrapper bg-primary-subtle text-primary rounded-3">
                    <i class="bi bi-calendar3 fs-4"></i>
                  </div>
                  <span class="badge status-badge-success" *ngIf="currentRole === 'ADMIN'">+{{ upcomingEventsCount }} Upcoming</span>
                  <span class="badge bg-light text-dark border" *ngIf="currentRole === 'PARTICIPANT'">Explore events</span>
                </div>
                <h6 class="text-muted text-uppercase fw-bold mb-1 small" style="letter-spacing: 0.5px;">
                  {{ currentRole === 'ADMIN' ? 'Active Events' : 'Available Events' }}
                </h6>
                <h2 class="display-6 fw-bold mb-0 text-dark">
                  {{ totalEvents }}
                </h2>
                <div class="mt-3 border-top pt-3 d-flex align-items-center justify-content-between">
                  <a routerLink="/events" class="text-decoration-none text-primary fw-semibold small hover-arrow">
                    {{ currentRole === 'ADMIN' ? 'Manage catalog' : 'Explore catalog' }} <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
              <div class="card-accent-border bg-primary"></div>
            </div>
          </div>

          <!-- Total Registrations Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden stat-card stat-card-green">
              <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="stat-icon-wrapper bg-success-subtle text-success rounded-3">
                    <i class="bi bi-ticket-perforated-fill fs-4"></i>
                  </div>
                  <span class="badge status-badge-warning" *ngIf="currentRole === 'ADMIN'">{{ activeRegistrationsCount }} Confirmed</span>
                  <span class="badge status-badge-success" *ngIf="currentRole === 'PARTICIPANT'">{{ activeRegistrationsCount }} Confirmed</span>
                </div>
                <h6 class="text-muted text-uppercase fw-bold mb-1 small" style="letter-spacing: 0.5px;">
                  {{ currentRole === 'ADMIN' ? 'Registrations' : 'My Active Bookings' }}
                </h6>
                <h2 class="display-6 fw-bold mb-0 text-dark">
                  {{ totalRegistrations }}
                </h2>
                <div class="mt-3 border-top pt-3 d-flex align-items-center justify-content-between">
                  <a routerLink="/participants" class="text-decoration-none text-success fw-semibold small hover-arrow">
                    {{ currentRole === 'ADMIN' ? 'View list' : 'View my tickets' }} <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
              <div class="card-accent-border bg-success"></div>
            </div>
          </div>

          <!-- Total Users Card -->
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100 hover-lift position-relative overflow-hidden stat-card stat-card-cyan">
              <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="stat-icon-wrapper bg-info-subtle text-info rounded-3">
                    <i class="bi bi-people-fill fs-4"></i>
                  </div>
                  <span class="badge bg-light text-dark border" *ngIf="currentRole === 'ADMIN'">Database size</span>
                  <span class="badge status-badge-warning" *ngIf="currentRole === 'PARTICIPANT'">Upcoming</span>
                </div>
                <h6 class="text-muted text-uppercase fw-bold mb-1 small" style="letter-spacing: 0.5px;">
                  {{ currentRole === 'ADMIN' ? 'Registered Accounts' : 'Upcoming Attending' }}
                </h6>
                <h2 class="display-6 fw-bold mb-0 text-dark">
                  {{ currentRole === 'ADMIN' ? totalUsers : upcomingEventsCount }}
                </h2>
                <div class="mt-3 border-top pt-3 d-flex align-items-center justify-content-between">
                  <a routerLink="/users" *ngIf="currentRole === 'ADMIN'" class="text-decoration-none text-info fw-semibold small hover-arrow">
                    Manage users <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                  <a routerLink="/events" *ngIf="currentRole === 'PARTICIPANT'" class="text-decoration-none text-info fw-semibold small hover-arrow">
                    Find more events <i class="bi bi-arrow-right ms-1"></i>
                  </a>
                </div>
              </div>
              <div class="card-accent-border bg-info"></div>
            </div>
          </div>
        </div>

        <!-- Timeline & Widgets Row -->
        <div class="row g-4 mb-4">
          <!-- Upcoming Events Timeline -->
          <div class="col-lg-8">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h4 class="fw-bold text-dark mb-0">
                    {{ currentRole === 'ADMIN' ? 'Upcoming Events' : 'Event Schedule Timeline' }}
                  </h4>
                  <p class="text-muted small mb-0">
                    {{ currentRole === 'ADMIN' ? 'List of events scheduled for registration.' : 'Manage your schedule and bookings.' }}
                  </p>
                </div>
                
                <!-- Toggle timeline view for Participant -->
                <div class="btn-group p-1 bg-light rounded-pill border" *ngIf="currentRole === 'PARTICIPANT'">
                  <button class="btn btn-sm rounded-pill px-3 py-1 text-xs border-0" 
                          [class.btn-primary]="timelineFilter === 'my'"
                          [class.btn-light]="timelineFilter !== 'my'"
                          (click)="toggleTimelineFilter('my')">My Schedule</button>
                  <button class="btn btn-sm rounded-pill px-3 py-1 text-xs border-0" 
                          [class.btn-primary]="timelineFilter === 'all'"
                          [class.btn-light]="timelineFilter !== 'all'"
                          (click)="toggleTimelineFilter('all')">All Upcoming Events</button>
                </div>
              </div>
              <div class="card-body p-4">
                <!-- Empty State -->
                <div *ngIf="upcomingEvents.length === 0" class="text-center py-5">
                  <i class="bi bi-calendar-x text-muted display-3 mb-3 d-block"></i>
                  <h5 class="text-dark fw-bold mb-1">
                    {{ currentRole === 'ADMIN' ? 'No upcoming events found' : 'No attending events scheduled' }}
                  </h5>
                  <p class="text-muted small mb-3">
                    {{ currentRole === 'ADMIN' 
                      ? 'Add a new event in the builder to start taking entries.' 
                      : 'You are not registered for any upcoming events. Head to the directory to sign up!' 
                    }}
                  </p>
                  <a [routerLink]="currentRole === 'ADMIN' ? '/events/create' : '/events'" class="btn btn-primary btn-sm px-4">
                    <i class="bi" [ngClass]="currentRole === 'ADMIN' ? 'bi-plus-lg' : 'bi-search'"></i>
                    {{ currentRole === 'ADMIN' ? 'Create Event' : 'Explore Events' }}
                  </a>
                </div>

                <!-- Timeline list -->
                <div *ngIf="upcomingEvents.length > 0" class="timeline-list d-flex flex-column gap-4">
                  <div *ngFor="let event of upcomingEvents" class="d-flex gap-3 hover-timeline-row p-2 rounded-3">
                    <!-- Calendar Badge Date -->
                    <div class="date-calendar-badge bg-white shadow-sm border border-light-subtle d-flex flex-column align-items-center justify-content-center flex-shrink-0">
                      <span class="d-block date-day fw-bold text-primary">{{ event.eventDate | date:'d' }}</span>
                      <span class="d-block date-month text-muted text-uppercase fw-semibold">{{ event.eventDate | date:'MMM' }}</span>
                    </div>

                    <!-- Details -->
                    <div class="flex-grow-1 min-width-0">
                      <div class="d-flex flex-wrap align-items-start justify-content-between mb-1 gap-2">
                        <h5 class="fw-bold text-dark mb-0 text-truncate">{{ event.eventName }}</h5>
                        <span class="badge bg-success-subtle text-success" style="font-size: 0.75rem;">
                          {{ getRegisteredCount(event.eventId) }} Booked
                        </span>
                      </div>
                      <p class="text-muted small mb-2 text-truncate-2">{{ event.description || 'No description available for this event.' }}</p>
                      

                      <div class="d-flex flex-wrap gap-3 text-muted small mt-2">
                        <span><i class="bi bi-clock me-1 text-primary"></i> {{ event.eventTime }}</span>
                        <span><i class="bi bi-geo-alt me-1 text-danger"></i> {{ event.venue || 'TBA' }}</span>
                      </div>
                    </div>

                    <!-- Register CTA (Only when not already registered) -->
                    <div class="align-self-center flex-shrink-0 ms-2" *ngIf="currentRole === 'PARTICIPANT' && !isUserRegisteredForEvent(event.eventId!)">
                      <a [routerLink]="['/register-participant']" [queryParams]="{eventId: event.eventId}" class="btn btn-light btn-sm rounded-circle shadow-sm border p-2 hover-primary-btn" title="Register For Event">
                        <i class="bi bi-person-plus-fill fs-5"></i>
                      </a>
                    </div>
                    <div class="align-self-center flex-shrink-0 ms-2" *ngIf="isUserRegisteredForEvent(event.eventId!)">
                      <span class="badge bg-success text-white rounded-pill px-2.5 py-1.5 small d-inline-flex align-items-center gap-1">
                        <i class="bi bi-check-circle-fill"></i> Attending
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Calendar Widget & Registration Trends -->
          <div class="col-lg-4 d-flex flex-column gap-4">
            <!-- Calendar Widget -->
            <div class="card border-0 shadow-sm bg-white overflow-hidden">
              <div class="card-body p-4">
                <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-2">
                  <h5 class="fw-bold text-dark mb-0">Event Calendar</h5>
                  <span class="text-muted fw-semibold small text-uppercase">August 2026</span>
                </div>
                <!-- Calendar Grid headers -->
                <div class="row text-center text-muted fw-semibold mb-2" style="font-size: 0.75rem;">
                  <div class="col-1-7">Su</div>
                  <div class="col-1-7">Mo</div>
                  <div class="col-1-7">Tu</div>
                  <div class="col-1-7">We</div>
                  <div class="col-1-7">Th</div>
                  <div class="col-1-7">Fr</div>
                  <div class="col-1-7">Sa</div>
                </div>
                <!-- Calendar Grid days -->
                <div class="row text-center row-gap-2">
                  <div *ngFor="let empty of [1,2,3,4,5]" class="col-1-7 text-muted opacity-25 small">-</div>
                  <div *ngFor="let day of calendarDays" class="col-1-7 position-relative d-flex align-items-center justify-content-center">
                    <span class="calendar-day-circle rounded-circle d-flex align-items-center justify-content-center small"
                          [ngClass]="{
                            'bg-primary text-white fw-bold': day.hasEvent,
                            'hover-bg-subtle text-dark': !day.hasEvent
                          }"
                          [title]="day.hasEvent ? 'Event Scheduled' : ''">
                      {{ day.dayNumber }}
                    </span>
                    <span *ngIf="day.hasEvent" class="position-absolute bottom-0 start-50 translate-middle-x bg-white rounded-circle" style="width: 4px; height: 4px; margin-bottom: 2px;"></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quick Action Links Panel -->
            <div class="card border-0 shadow-sm bg-white">
              <div class="card-body p-4">
                <h5 class="fw-bold text-dark mb-3">
                  {{ currentRole === 'ADMIN' ? 'Administrative Tasks' : 'Quick Actions' }}
                </h5>
                <div class="d-flex flex-column gap-2">
                  <!-- Admin Actions -->
                  <a routerLink="/events/create" *ngIf="currentRole === 'ADMIN'" class="quick-action-row d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none">
                    <div class="action-icon bg-primary-subtle text-primary rounded-3">
                      <i class="bi bi-calendar-plus-fill"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold text-dark mb-0">Create New Event</h6>
                      <span class="text-muted small">Design a registration portal</span>
                    </div>
                    <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </a>

                  <!-- Participant Actions -->
                  <a routerLink="/events" *ngIf="currentRole === 'PARTICIPANT'" class="quick-action-row d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none">
                    <div class="action-icon bg-primary-subtle text-primary rounded-3">
                      <i class="bi bi-search"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold text-dark mb-0">Explore Events Catalog</h6>
                      <span class="text-muted small">Find upcoming seminars/workshops</span>
                    </div>
                    <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </a>

                  <a routerLink="/participants" *ngIf="currentRole === 'PARTICIPANT'" class="quick-action-row d-flex align-items-center gap-3 p-3 rounded-3 text-decoration-none">
                    <div class="action-icon bg-success-subtle text-success rounded-3">
                      <i class="bi bi-ticket-detailed-fill"></i>
                    </div>
                    <div>
                      <h6 class="fw-bold text-dark mb-0">My Registration Tickets</h6>
                      <span class="text-muted small">Check booking receipts</span>
                    </div>
                    <i class="bi bi-chevron-right ms-auto text-muted"></i>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Registrations Row -->
        <div class="row">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-transparent border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
                <div>
                  <h4 class="fw-bold text-dark mb-0">
                    {{ currentRole === 'ADMIN' ? 'Recent Registrations Activity' : 'My Recent Bookings History' }}
                  </h4>
                  <p class="text-muted small mb-0">
                    {{ currentRole === 'ADMIN' ? 'Latest additions to the portal records.' : 'Review your past and current event confirmations.' }}
                  </p>
                </div>
                <a routerLink="/participants" class="btn btn-outline-primary btn-sm px-3 rounded-pill">
                  {{ currentRole === 'ADMIN' ? 'View All Registrations' : 'View My Registrations' }}
                </a>
              </div>
              <div class="card-body p-4">
                <div *ngIf="recentRegistrations.length === 0" class="text-center py-4">
                  <i class="bi bi-card-list text-muted display-4 mb-2 d-block"></i>
                  <h6 class="text-muted">No registration records found in system</h6>
                </div>

                <div *ngIf="recentRegistrations.length > 0" class="table-responsive">
                  <table class="table align-middle mb-0 rounded-table border border-light-subtle">
                    <thead class="bg-light-subtle text-muted text-uppercase small" style="font-size: 0.75rem;">
                      <tr>
                        <th class="ps-4">Participant</th>
                        <th>Event</th>
                        <th>Date Registered</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr *ngFor="let reg of recentRegistrations">
                        <td class="ps-4">
                          <div class="d-flex align-items-center gap-3">
                            <div class="avatar bg-primary-subtle text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style="width: 34px; height: 34px; font-size: 0.8rem;">
                              {{ getInitials(reg.user?.name) }}
                            </div>
                            <div>
                              <h6 class="fw-bold mb-0 text-body" style="font-size: 0.875rem;">{{ reg.user?.name }}</h6>
                              <span class="text-muted small">{{ reg.user?.email }}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span class="badge bg-light text-body border px-2.5 py-1.5 fw-medium border-light-subtle" style="font-size: 0.75rem;">
                            {{ reg.event.eventName }}
                          </span>
                        </td>
                        <td class="text-muted small">{{ reg.registrationDate | date:'medium' }}</td>
                        <td>
                          <span class="status-badge" 
                                [ngClass]="reg.status === 'REGISTERED' ? 'status-badge-success' : 'status-badge-danger'">
                            <span class="status-dot bg-current"></span>
                            {{ reg.status === 'REGISTERED' ? 'Confirmed' : 'Cancelled' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Custom HTML Dialog Modal: Instant Registration -->
    <div *ngIf="showRegisterModal" class="custom-modal-backdrop">
      <div class="custom-modal-content p-4">
        <div class="text-center">
          <div class="bg-success-subtle text-success rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3" style="width: 54px; height: 54px;">
            <i class="bi bi-check-circle-fill fs-3"></i>
          </div>
          <h4 class="fw-bold text-dark mb-2">Book Event Ticket?</h4>
          <p class="text-muted small mb-4">
            Do you want to confirm your registration ticket for <strong>{{ targetRegisterEvent?.eventName }}</strong>? 
            This booking will lock 1 seat from the capacity pool.
          </p>
        </div>
        <div class="d-flex gap-2">
          <button (click)="showRegisterModal = false" class="btn btn-outline-secondary flex-grow-1 py-2 border-light-subtle rounded-3">Cancel</button>
          <button (click)="confirmRegistration()" class="btn btn-success flex-grow-1 py-2 rounded-3">Confirm Ticket</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hero-banner {
      border-radius: 1.25rem !important;
      background: url('/images/hero_bg.jpg') no-repeat center center / cover !important;
      position: relative;
    }
    .hero-banner::before {
      content: "";
      position: absolute;
      top: 0; right: 0; bottom: 0; left: 0;
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.85) 100%) !important;
      z-index: 1;
      border-radius: 1.25rem !important;
    }
    .hero-gradient-orb {
      position: absolute;
      width: 400px;
      height: 400px;
      border-radius: 50%;
      filter: blur(100px);
      z-index: 1;
      opacity: 0.2;
      bottom: -150px;
      left: -150px;
    }
    .z-2 {
      z-index: 2;
    }
    .bg-white-10 {
      background-color: rgba(255, 255, 255, 0.08);
    }
    .border-white-10 {
      border-color: rgba(255, 255, 255, 0.12) !important;
    }
    .stat-card {
      border-radius: 1.25rem !important;
    }
    .stat-card-indigo {
      background: linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%) !important;
    }
    .stat-card-green {
      background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%) !important;
    }
    .stat-card-cyan {
      background: linear-gradient(135deg, #ffffff 0%, #ecfeff 100%) !important;
    }
    body.dark-theme .stat-card-indigo {
      background: linear-gradient(135deg, #1e293b 0%, #2e2a4a 100%) !important;
    }
    body.dark-theme .stat-card-green {
      background: linear-gradient(135deg, #1e293b 0%, #203f30 100%) !important;
    }
    body.dark-theme .stat-card-cyan {
      background: linear-gradient(135deg, #1e293b 0%, #1c3d42 100%) !important;
    }
    .stat-icon-wrapper {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(79, 70, 229, 0.08) !important;
    }
    .card-accent-border {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 4px;
    }
    .hover-arrow i {
      transition: transform 0.2s ease;
    }
    .hover-arrow:hover i {
      transform: translateX(3px);
    }
    .date-calendar-badge {
      width: 60px;
      height: 60px;
      border-radius: 0.75rem;
    }
    .date-day {
      font-size: 1.25rem;
      line-height: 1;
    }
    .date-month {
      font-size: 0.65rem;
      letter-spacing: 0.5px;
    }
    .hover-timeline-row {
      transition: all 0.2s ease-in-out;
      border: 1px solid transparent;
    }
    .hover-timeline-row:hover {
      background-color: #f8fafc;
      border-color: #f1f5f9;
    }
    .hover-primary-btn:hover {
      background-color: var(--primary) !important;
      color: white !important;
      border-color: var(--primary) !important;
    }
    .text-truncate-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .col-1-7 {
      width: 14.28%;
      flex: 0 0 14.28%;
      max-width: 14.28%;
    }
    .calendar-day-circle {
      width: 32px;
      height: 32px;
      line-height: 32px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .quick-action-row {
      border: 1px solid #f1f5f9;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .quick-action-row:hover {
      background-color: #f8fafc;
      border-color: rgba(79, 70, 229, 0.15);
      transform: translateX(3px);
    }
    .action-icon {
      width: 42px;
      height: 42px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
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
    .fs-7 {
      font-size: 0.8rem;
    }
    .text-xs {
      font-size: 0.75rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  today = new Date();

  currentRole = 'ADMIN';
  currentUserId = 2;
  currentUserName = '';

  totalEvents = 0;
  totalRegistrations = 0;
  totalUsers = 0;
  upcomingEventsCount = 0;
  activeRegistrationsCount = 0;

  allEvents: Event[] = [];
  upcomingEvents: Event[] = [];
  recentRegistrations: Registration[] = [];
  eventRegCountsMap = new Map<number, number>();
  userBookedEventsSet = new Set<number>();

  calendarDays: CalendarDay[] = [];
  timelineFilter: 'my' | 'all' = 'my';

  showRegisterModal = false;
  targetRegisterEvent: Event | null = null;

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService,
    private userService: UserService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.buildCalendarGrid();
  }

  ngOnInit(): void {
    // Load context role
    this.currentRole = localStorage.getItem('current_role') || 'ADMIN';
    const savedUserId = localStorage.getItem('current_user_id');
    this.currentUserId = savedUserId ? +savedUserId : 2;

    forkJoin({
      events: this.eventService.getAllEvents(),
      registrations: this.registrationService.getAll(),
      users: this.userService.getAllUsers()
    }).subscribe({
      next: ({ events, registrations, users }) => {
        const eventsList = events || [];
        const registrationsList = registrations || [];
        const usersList = users || [];

        this.allEvents = eventsList;
        this.totalEvents = eventsList.length;
        this.totalUsers = usersList.length;

        // Map register counts
        const eventRegCounts = new Map<number, number>();
        registrationsList.forEach(r => {
          if (r && r.event?.eventId && r.status === 'REGISTERED') {
            eventRegCounts.set(r.event.eventId, (eventRegCounts.get(r.event.eventId) || 0) + 1);
          }
        });
        this.eventRegCountsMap = eventRegCounts;

        // Extract user booked event IDs for attending tag check
        const myBookedSet = new Set<number>();
        registrationsList.forEach(r => {
          if (r && r.user?.userId === this.currentUserId && r.status === 'REGISTERED') {
            myBookedSet.add(r.event.eventId!);
          }
        });
        this.userBookedEventsSet = myBookedSet;

        const currentDateStr = new Date().toISOString().split('T')[0];

        if (this.currentRole === 'ADMIN') {
          // Standard admin data
          this.totalRegistrations = registrationsList.length;
          this.activeRegistrationsCount = registrationsList.filter(r => r && r.status === 'REGISTERED').length;
          
          this.upcomingEvents = eventsList.filter(e => {
            return e && e.eventDate && e.eventDate >= currentDateStr;
          }).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
          this.upcomingEventsCount = this.upcomingEvents.length;

          this.recentRegistrations = [...registrationsList]
            .sort((a, b) => (b.registrationId || 0) - (a.registrationId || 0))
            .slice(0, 3);
        } else {
          // Participant personalized metrics
          const userObj = usersList.find(u => u.userId === this.currentUserId);
          this.currentUserName = userObj?.name || 'Participant';

          const myRegs = registrationsList.filter(r => r && r.user?.userId === this.currentUserId);
          this.totalRegistrations = myRegs.length;
          this.activeRegistrationsCount = myRegs.filter(r => r.status === 'REGISTERED').length;

          const myUpcomingRegs = myRegs.filter(r => {
            return r.status === 'REGISTERED' && r.event?.eventDate && r.event.eventDate >= currentDateStr;
          });
          this.upcomingEventsCount = myUpcomingRegs.length;

          // Recent registrations for participant only
          this.recentRegistrations = [...myRegs]
            .sort((a, b) => (b.registrationId || 0) - (a.registrationId || 0))
            .slice(0, 3);

          this.timelineFilter = 'my';
          this.loadTimelineData();
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading dashboard metrics', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadTimelineData() {
    const currentDateStr = new Date().toISOString().split('T')[0];
    
    if (this.timelineFilter === 'my') {
      // Show events registered by current user
      this.upcomingEvents = this.allEvents.filter(e => {
        return this.userBookedEventsSet.has(e.eventId!) && e.eventDate >= currentDateStr;
      }).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
    } else {
      // Show all upcoming events
      this.upcomingEvents = this.allEvents.filter(e => {
        return e.eventDate >= currentDateStr;
      }).sort((a, b) => (a.eventDate || '').localeCompare(b.eventDate || ''));
    }
  }

  toggleTimelineFilter(filter: 'my' | 'all') {
    this.timelineFilter = filter;
    this.loadTimelineData();
    this.cdr.detectChanges();
  }

  isUserRegisteredForEvent(eventId: number): boolean {
    return this.userBookedEventsSet.has(eventId);
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

  triggerRegisterModal(event: Event) {
    this.targetRegisterEvent = event;
    this.showRegisterModal = true;
  }

  confirmRegistration() {
    if (!this.targetRegisterEvent) return;

    this.showRegisterModal = false;
    this.loading = true;

    const registrationPayload = {
      user: {
        userId: this.currentUserId
      },
      event: {
        eventId: this.targetRegisterEvent.eventId
      },
      registrationDate: new Date().toISOString().split('.')[0],
      status: 'REGISTERED'
    };

    this.registrationService.register(registrationPayload as any).subscribe({
      next: () => {
        this.notification.showSuccess(`Confirm ticket booked for ${this.targetRegisterEvent?.eventName}!`);
        this.ngOnInit(); // reload all state dynamically
      },
      error: (err) => {
        console.error('Error booking ticket', err);
        this.notification.showError(err.error?.message || 'Failed to complete registration.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private buildCalendarGrid() {
    const eventDays = [10, 15];
    const days: CalendarDay[] = [];
    for (let d = 1; d <= 31; d++) {
      days.push({
        dayNumber: d,
        hasEvent: eventDays.includes(d)
      });
    }
    this.calendarDays = days;
  }
}
