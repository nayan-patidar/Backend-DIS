import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private injector: Injector) {}

  handleError(error: any): void {
    console.error('Captured by GlobalErrorHandler:', error);
    
    // Retrieve NotificationService dynamically to prevent circular dependencies
    try {
      const notification = this.injector.get(NotificationService);
      const message = error?.message || error?.toString() || 'An unexpected runtime error occurred.';
      notification.showError(`Application Error: ${message}`);
    } catch (e) {
      // Fallback if injector fails
      console.error('Failed to notify error via service:', e);
    }
  }
}
