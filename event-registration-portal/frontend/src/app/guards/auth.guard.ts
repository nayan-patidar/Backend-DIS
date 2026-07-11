import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private notification: NotificationService) {}

  canActivate(): boolean | UrlTree {
    const isLoggedIn = !!localStorage.getItem('current_user_id');
    if (!isLoggedIn) {
      this.notification.showWarning('Please login to access this page.');
      return this.router.createUrlTree(['/login']);
    }
    return true;
  }
}
