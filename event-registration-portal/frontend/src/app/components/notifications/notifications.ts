import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserNotificationService } from '../../services/user-notification.service';
import { UserNotification } from '../../models/user-notification.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notifications-wrapper min-vh-100 py-4 px-2">
      <div class="container max-w-800">
        
        <!-- Header -->
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
          <div>
            <h3 class="fw-bolder text-dark mb-1">Notifications</h3>
            <p class="text-muted small mb-0">System alerts, event updates, and registration status.</p>
          </div>
          <button (click)="markAllAsRead()" class="btn btn-outline-primary btn-sm px-3 py-2 rounded-3 d-flex align-items-center gap-2">
            <i class="bi bi-check2-all fs-5"></i> Mark All as Read
          </button>
        </div>

        <!-- Controls (Search & Filter) -->
        <div class="card bg-white p-3 rounded-4 mb-4 d-flex flex-column flex-md-row gap-3 border shadow-sm">
          <div class="position-relative flex-grow-1 search-box-container">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="filterNotifications()"
                   placeholder="Search notifications..." 
                   class="form-control rounded-pill border-light-subtle ps-5 py-2 bg-light text-dark w-100" />
          </div>
          
          <div class="d-flex gap-2 filter-pills">
            <button class="btn rounded-pill px-3 py-1 text-sm fw-semibold" 
                    [ngClass]="currentFilter === 'all' ? 'bg-primary text-white' : 'btn-outline-secondary border-light-subtle text-muted'"
                    (click)="setFilter('all')">All</button>
            <button class="btn rounded-pill px-3 py-1 text-sm fw-semibold" 
                    [ngClass]="currentFilter === 'unread' ? 'bg-primary text-white' : 'btn-outline-secondary border-light-subtle text-muted'"
                    (click)="setFilter('unread')">Unread</button>
            <button class="btn rounded-pill px-3 py-1 text-sm fw-semibold" 
                    [ngClass]="currentFilter === 'read' ? 'bg-primary text-white' : 'btn-outline-secondary border-light-subtle text-muted'"
                    (click)="setFilter('read')">Read</button>
          </div>
        </div>

        <!-- Notification List -->
        <div class="d-flex flex-column gap-3">
          <!-- Empty State -->
          <div *ngIf="filteredNotifications.length === 0" class="card bg-white border rounded-4 p-5 text-center my-4 shadow-sm">
            <div class="empty-state-svg mx-auto mb-4 text-muted">
              <i class="bi bi-bell-slash display-1 opacity-50"></i>
            </div>
            <h4 class="fw-bold text-dark mb-2">No Notifications Found</h4>
            <p class="text-muted small">You're all caught up! There are no matching alerts in your feed.</p>
          </div>

          <!-- Cards -->
          <div *ngFor="let notification of filteredNotifications" 
               class="card bg-white rounded-4 p-4 border shadow-sm hover-lift transition-all position-relative overflow-hidden cursor-pointer"
               [class.unread-card]="!notification.read"
               (click)="markAsRead(notification.id)">
            
            <!-- Unread Indicator Line -->
            <div *ngIf="!notification.read" class="position-absolute top-0 start-0 w-100 h-100 pointer-events-none" 
                 style="background: linear-gradient(90deg, rgba(99, 102, 241, 0.05) 0%, transparent 100%); z-index: 0;"></div>

            <div class="d-flex gap-3 align-items-start position-relative z-1">
              <!-- Icon -->
              <div class="notification-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                   [ngClass]="getIconClass(notification.type)">
                <i class="bi fs-5" [ngClass]="getIconForType(notification.type)"></i>
              </div>
              
              <!-- Content -->
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-start mb-1">
                  <h6 class="fw-bold mb-0 text-dark" [class.text-primary]="!notification.read">{{ notification.title }}</h6>
                  <span class="text-muted text-xs ms-2 flex-shrink-0"><i class="bi bi-clock me-1"></i>{{ notification.time }}</span>
                </div>
                <p class="text-muted text-sm mb-0 mt-1">{{ notification.message }}</p>
              </div>

              <!-- Unread Dot -->
              <div *ngIf="!notification.read" class="unread-dot bg-primary rounded-circle flex-shrink-0 ms-2" style="width: 10px; height: 10px; margin-top: 6px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .max-w-800 { max-width: 800px; margin: 0 auto; }
    
    .hover-lift { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .hover-lift:hover {
      transform: translateY(-3px);
      border-color: var(--primary) !important;
      box-shadow: var(--shadow-lg) !important;
    }
    
    .unread-card {
      border-left: 3px solid var(--primary) !important;
    }
    
    .notification-icon {
      width: 48px;
      height: 48px;
    }
    
    .icon-system { background: rgba(99, 102, 241, 0.1); color: var(--primary); border: 1px solid rgba(99, 102, 241, 0.2); }
    .icon-event { background: rgba(6, 182, 212, 0.1); color: var(--secondary); border: 1px solid rgba(6, 182, 212, 0.2); }
    .icon-registration { background: rgba(34, 197, 94, 0.1); color: var(--success); border: 1px solid rgba(34, 197, 94, 0.2); }
    .icon-alert { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
    
    .cursor-pointer { cursor: pointer; }
    .pointer-events-none { pointer-events: none; }
  `]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: UserNotification[] = [];
  filteredNotifications: UserNotification[] = [];
  searchQuery = '';
  currentFilter: 'all' | 'unread' | 'read' = 'all';
  private sub?: Subscription;

  constructor(private notificationService: UserNotificationService) {}

  ngOnInit() {
    this.sub = this.notificationService.getNotifications().subscribe(data => {
      this.notifications = data;
      this.filterNotifications();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  setFilter(filter: 'all' | 'unread' | 'read') {
    this.currentFilter = filter;
    this.filterNotifications();
  }

  filterNotifications() {
    let result = this.notifications;
    
    if (this.currentFilter === 'unread') {
      result = result.filter(n => !n.read);
    } else if (this.currentFilter === 'read') {
      result = result.filter(n => n.read);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q)
      );
    }

    this.filteredNotifications = result;
  }

  markAsRead(id: string) {
    this.notificationService.markAsRead(id);
  }

  markAllAsRead() {
    this.notificationService.markAllAsRead();
  }

  getIconForType(type: string): string {
    switch(type) {
      case 'system': return 'bi-motherboard-fill';
      case 'event': return 'bi-stars';
      case 'registration': return 'bi-ticket-detailed-fill';
      case 'alert': return 'bi-shield-exclamation';
      default: return 'bi-bell-fill';
    }
  }

  getIconClass(type: string): string {
    switch(type) {
      case 'system': return 'icon-system';
      case 'event': return 'icon-event';
      case 'registration': return 'icon-registration';
      case 'alert': return 'icon-alert';
      default: return 'icon-system';
    }
  }
}
