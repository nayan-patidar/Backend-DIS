import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { EventService } from '../../services/event.service';
import { RegistrationService } from '../../services/registration.service';
import { NotificationService } from '../../services/notification.service';
import { Event } from '../../models/event.model';

interface EventWithCounts extends Event {
  registeredCount: number;
}

interface EventGroup {
  name: string;
  events: EventWithCounts[];
}

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="events-wrapper min-vh-100 py-4 px-2">
      <!-- Title Header -->
      <div class="events-main-header rounded-4 bg-white border d-flex justify-content-between align-items-center p-5 mb-4 mx-3 shadow-sm position-relative overflow-hidden">
        <div class="header-content z-2">
          <h1 class="display-4 fw-bolder mb-2 text-dark" style="letter-spacing: -0.03em;">EVENTS</h1>
          <p class="text-muted fs-5 mb-0">Discover, manage and participate in amazing events.</p>
        </div>
        <div class="header-illustration d-none d-md-block position-absolute end-0 bottom-0 pe-4">
          <!-- Calendar Illustration -->
          <img src="/images/calendar_illustration.jpg" alt="Calendar Illustration" class="img-fluid" style="max-height: 200px; opacity: 0.9;" onerror="this.style.display='none'">
        </div>
      </div>



      <div class="container-xl">
        <!-- Controls -->
        <div class="card bg-white border shadow-sm p-4 mb-4">
          <div class="row align-items-center g-3">
            <div class="col-md-6">
              <h6 class="fw-bold text-dark mb-1 text-uppercase" style="letter-spacing: 0.5px;">PORTAL CONTROLS</h6>
              <p class="text-muted small mb-0">Query and filter live event catalog nodes.</p>
            </div>
            <div class="col-md-6 text-md-end d-flex gap-2 justify-content-md-end" *ngIf="currentRole === 'ADMIN'">
              <a routerLink="/events/create" class="btn btn-primary d-flex align-items-center gap-2 shadow-sm fw-semibold px-4 rounded-3">
                <i class="bi bi-plus-lg"></i> CREATE EVENT
              </a>
            </div>
          </div>

          <div class="row mt-4 g-3 align-items-center">
            <!-- Live Search -->
            <div class="col-lg-6 position-relative">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input
                type="text"
                class="form-control ps-5 rounded-3 py-2 bg-light border-light-subtle"
                placeholder="Search event title, venue, or description..."
                [(ngModel)]="searchQuery"
                (input)="filterEvents()"
              />
            </div>
            <!-- Sort Selector -->
            <div class="col-lg-4 ms-auto d-flex gap-3 align-items-center justify-content-end">
              <select class="form-select py-2 bg-white" [(ngModel)]="selectedFilter" (change)="filterEvents()" style="max-width: 200px;">
                <option value="all">Status: All</option>
                <option value="upcoming">Upcoming Events</option>
                <option value="past">Past Events</option>
              </select>
              
              <div class="btn-group border rounded-3 p-1 bg-white shadow-sm">
                <button type="button" class="btn btn-sm rounded-2 py-1 px-3 border-0 d-flex align-items-center justify-content-center" 
                        [ngClass]="isGridView ? 'bg-primary-subtle text-primary fw-bold' : 'text-muted hover-bg-subtle'"
                        (click)="isGridView = true">
                  <i class="bi bi-grid-3x3-gap-fill fs-6"></i>
                </button>
                <button type="button" class="btn btn-sm rounded-2 py-1 px-3 border-0 d-flex align-items-center justify-content-center" 
                        [ngClass]="!isGridView ? 'bg-primary-subtle text-primary fw-bold' : 'text-muted hover-bg-subtle'"
                        (click)="isGridView = false">
                  <i class="bi bi-list-task fs-6"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Flat Event Nodes (Grid Layout) -->
        <div *ngIf="isGridView && filteredEvents.length > 0" class="row g-4 mt-2">
          <div *ngFor="let event of filteredEvents" class="col-md-6 col-lg-4 col-xl-3 animate-card">
            <div class="card border bg-white shadow-sm position-relative overflow-hidden rounded-4 hover-lift h-100">
              <!-- Card Banner -->
              <div class="position-relative overflow-hidden rounded-top-4" style="height: 160px;">
                <span class="position-absolute top-0 start-0 m-3 badge bg-primary text-white px-2 py-1 text-uppercase rounded-1 shadow-sm" style="z-index: 10; font-size: 0.65rem; letter-spacing: 0.5px;">{{ getEventCategory(event) }}</span>
                <img [src]="getEventImage(event)" class="w-100 h-100 object-fit-cover card-banner" alt="Event banner" />
              </div>

              <!-- Card Body -->
              <div class="card-body p-4 bg-white d-flex flex-column justify-content-between position-relative rounded-bottom-4">
                <div>
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <h5 class="fw-bold text-dark mb-0 text-truncate pe-2">{{ event.eventName }}</h5>
                  </div>
                  <p class="text-muted text-xs text-truncate-3 mb-4" style="min-height: 3.5em;">{{ event.description || 'Join premium organizers at this network portal event.' }}</p>
                  
                  <div class="d-flex flex-column gap-2 mb-4">
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-geo-alt me-2 text-muted"></i>
                      <span class="text-truncate">{{ event.venue || 'Computer Lab 1, Block A' }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-calendar-event me-2 text-muted"></i>
                      <span>{{ event.eventTime || '15 May 2024 • 10:00 AM' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Available capacity meter & Register -->
                <div>
                  <div class="d-flex justify-content-between align-items-center text-muted small mb-3">
                    <span class="badge bg-primary-subtle text-primary rounded-1 px-2 py-1 fw-bold" style="font-size: 0.65rem; letter-spacing: 0.5px;">UPCOMING</span>
                    <span class="fw-semibold d-flex align-items-center gap-1"><i class="bi bi-people-fill text-muted"></i> {{ event.registeredCount }} / 150</span>
                  </div>

                  <div class="d-flex gap-2">
                    <a
                      *ngIf="currentRole === 'PARTICIPANT'"
                      [routerLink]="['/register-participant']"
                      [queryParams]="{eventId: event.eventId}"
                      class="btn btn-primary btn-sm flex-grow-1 py-2 fw-semibold"
                    >
                      REGISTER
                    </a>
                    <button
                      *ngIf="currentRole === 'ADMIN'"
                      (click)="onDelete(event.eventId!)"
                      class="btn btn-outline-danger btn-sm py-2 px-2.5 d-flex align-items-center justify-content-center"
                      title="Delete Event"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Event List (List Layout) -->
        <div *ngIf="!isGridView && filteredEvents.length > 0" class="d-flex flex-column gap-3 mt-2">
          <div *ngFor="let event of filteredEvents" class="card border bg-white shadow-sm overflow-hidden rounded-4 hover-lift">
            <div class="row g-0 align-items-center">
              <div class="col-md-3 col-lg-2">
                <img [src]="getEventImage(event)" class="img-fluid w-100 h-100 object-fit-cover" alt="Event banner" style="min-height: 120px;">
              </div>
              <div class="col-md-9 col-lg-10 p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                <div class="flex-grow-1">
                  <div class="d-flex align-items-center gap-2 mb-1">
                    <span class="badge bg-primary-subtle text-primary text-uppercase px-2 py-1 rounded-1" style="font-size: 0.65rem;">{{ getEventCategory(event) }}</span>
                    <span class="badge bg-light text-dark border text-uppercase px-2 py-1 rounded-1" style="font-size: 0.65rem;">UPCOMING</span>
                  </div>
                  <h5 class="fw-bold text-dark mb-1">{{ event.eventName }}</h5>
                  <p class="text-muted small mb-2 text-truncate" style="max-width: 600px;">{{ event.description || 'Join premium organizers at this network portal event.' }}</p>
                  
                  <div class="d-flex gap-4">
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-geo-alt me-1 text-primary"></i>
                      <span>{{ event.venue || 'Computer Lab 1, Block A' }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-calendar-event me-1 text-primary"></i>
                      <span>{{ event.eventTime || '10:00 AM' }} ({{ event.eventDate || '15 May 2024' }})</span>
                    </div>
                  </div>
                </div>
                
                <div class="d-flex flex-column align-items-md-end gap-2 ms-md-4 mt-3 mt-md-0 border-start ps-md-4">
                  <span class="fw-semibold text-muted d-flex align-items-center gap-1 mb-2"><i class="bi bi-people-fill"></i> {{ event.registeredCount }} / 150</span>
                  
                  <div class="d-flex gap-2">
                    <a
                      *ngIf="currentRole === 'PARTICIPANT'"
                      [routerLink]="['/register-participant']"
                      [queryParams]="{eventId: event.eventId}"
                      class="btn btn-primary px-4 fw-semibold shadow-sm"
                    >
                      REGISTER
                    </a>
                    <button
                      *ngIf="currentRole === 'ADMIN'"
                      (click)="onDelete(event.eventId!)"
                      class="btn btn-outline-danger px-3 d-flex align-items-center gap-2"
                    >
                      <i class="bi bi-trash"></i> DELETE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div class="card border-0 shadow-sm p-5 text-center my-4 card-theme" *ngIf="filteredEvents.length === 0">
          <i class="bi bi-folder-x text-muted display-1 mb-3"></i>
          <h4 class="fw-bold text-main">NO ACTIVE RECORDS FOUND</h4>
          <p class="text-muted mb-0">No event nodes match your query filters. Expand your parameters and try again.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .events-main-header {
      background: #ffffff;
    }
    .events-main-title {
      font-size: 3.5rem;
      letter-spacing: -0.02em;
    }

    .hover-lift {
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .hover-lift:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg) !important;
      border-color: var(--primary) !important;
    }
    
    .card-banner {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .hover-lift:hover .card-banner {
      transform: scale(1.05);
    }

    .text-xs {
      font-size: 0.75rem !important;
    }
    
    .hover-bg-subtle:hover {
      background-color: rgba(99, 102, 241, 0.05);
    }
  `]
})
export class EventListComponent implements OnInit {
  events: EventWithCounts[] = [];
  filteredEvents: EventWithCounts[] = [];
  
  searchQuery = '';
  selectedFilter = 'all';
  isGridView = true;

  currentRole = 'ADMIN';

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService,
    private notification: NotificationService,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentRole = localStorage.getItem('current_role') || 'ADMIN';
    this.route.queryParams.subscribe(params => {
      if (params['search']) {
        this.searchQuery = params['search'];
      }
    });
    this.loadEvents();
  }

  getEventCategory(event: Event): string {
    const name = event.eventName?.toLowerCase() || '';
    if (name.includes('workshop') || name.includes('hackathon') || name.includes('ai') || name.includes('coding') || name.includes('tech') || name.includes('web')) {
      return 'Technology';
    }
    if (name.includes('business') || name.includes('marketing') || name.includes('finance') || name.includes('seminar') || name.includes('management')) {
      return 'Business';
    }
    return 'Music';
  }

  loadEvents() {
    forkJoin({
      events: this.eventService.getAllEvents(),
      registrations: this.registrationService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ events, registrations }) => {
        const registrationsList = registrations || [];
        const eventRegCounts = new Map<number, number>();
        
        registrationsList.forEach(r => {
          if (r && r.event?.eventId && r.status === 'REGISTERED') {
            eventRegCounts.set(r.event.eventId, (eventRegCounts.get(r.event.eventId) || 0) + 1);
          }
        });

        this.events = (events || []).map(event => ({
          ...event,
          registeredCount: eventRegCounts.get(event.eventId!) || 0
        }));

        this.filterEvents();
      },
      error: (err) => {
        console.error('Error loading events list', err);
        this.notification.showError('Could not sync active event registries.');
      }
    });
  }



  filterEvents() {
    let result = [...this.events];

    // Filter by Search Query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter(e => 
        e.eventName?.toLowerCase().includes(q) ||
        e.venue?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q)
      );
    }

    // Filter by dropdown filter status
    if (this.selectedFilter === 'upcoming') {
      const now = new Date();
      result = result.filter(e => new Date(e.eventDate!) >= now);
    } else if (this.selectedFilter === 'past') {
      const now = new Date();
      result = result.filter(e => new Date(e.eventDate!) < now);
    }

    // Filter by active tab categories removed

    this.filteredEvents = result;
    this.cdr.detectChanges();
  }



  getEventImage(event: Event): string {
    const id = event.eventId || 1;
    const category = this.getEventCategory(event).toLowerCase();
    return `https://loremflickr.com/800/600/${category}?lock=${id}`;
  }

  onDelete(eventId: number) {
    if (confirm('Are you sure you want to delete this event? This will release all associated registrations.')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: () => {
          this.notification.showSuccess('Event node deleted successfully.');
          this.loadEvents();
        },
        error: (err) => {
          console.error('Error deleting event', err);
          this.notification.showError('Could not delete event. Event may be referenced.');
        }
      });
    }
  }
}
