import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserNotification } from '../models/user-notification.model';

@Injectable({
  providedIn: 'root'
})
export class UserNotificationService {
  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor() {
    this.loadMockData();
  }

  private loadMockData() {
    const role = localStorage.getItem('current_role') || 'PARTICIPANT';
    const storageKey = `mock_notifications_${role}`;
    const stored = localStorage.getItem(storageKey);
    
    let mockData: UserNotification[] = [];

    if (stored) {
      mockData = JSON.parse(stored);
    } else {
      if (role === 'ADMIN') {
        mockData = [
          { id: '4', title: 'Welcome', message: 'Welcome to Eventora Admin Portal! Configure system settings.', time: '1d ago', read: false, type: 'system' }
        ];
      } else {
        mockData = [
          { id: '3', title: 'Welcome', message: 'Welcome to Eventora! Explore events and update your profile.', time: '1d ago', read: false, type: 'system' }
        ];
      }
      localStorage.setItem(storageKey, JSON.stringify(mockData));
    }

    this.notificationsSubject.next(mockData);
    this.updateUnreadCount();
  }

  addNotification(title: string, message: string, type: 'system' | 'event' | 'registration' | 'alert') {
    const role = localStorage.getItem('current_role') || 'PARTICIPANT';
    const storageKey = `mock_notifications_${role}`;
    
    const newNotif: UserNotification = {
      id: Date.now().toString(),
      title,
      message,
      time: 'Just now',
      read: false,
      type
    };

    const current = this.notificationsSubject.getValue();
    const updated = [newNotif, ...current];
    
    localStorage.setItem(storageKey, JSON.stringify(updated));
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  getNotifications(): Observable<UserNotification[]> {
    return this.notifications$;
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$;
  }

  markAsRead(id: string) {
    const current = this.notificationsSubject.getValue();
    const updated = current.map(n => n.id === id ? { ...n, read: true } : n);
    
    const role = localStorage.getItem('current_role') || 'PARTICIPANT';
    localStorage.setItem(`mock_notifications_${role}`, JSON.stringify(updated));
    
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  markAllAsRead() {
    const current = this.notificationsSubject.getValue();
    const updated = current.map(n => ({ ...n, read: true }));
    
    const role = localStorage.getItem('current_role') || 'PARTICIPANT';
    localStorage.setItem(`mock_notifications_${role}`, JSON.stringify(updated));
    
    this.notificationsSubject.next(updated);
    this.updateUnreadCount();
  }

  private updateUnreadCount() {
    const current = this.notificationsSubject.getValue();
    const unread = current.filter(n => !n.read).length;
    this.unreadCountSubject.next(unread);
  }
}
