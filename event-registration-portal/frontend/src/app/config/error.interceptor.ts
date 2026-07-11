import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notification = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';

      if (error.status === 0) {
        errorMessage = 'Network error: Please check if your backend server is running.';
      } else if (error.status === 400) {
        errorMessage = `Bad Request (400): ${error.error?.message || error.message}`;
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized (401): Please login again.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden (403): Access denied.';
      } else if (error.status === 404) {
        errorMessage = `Not Found (404): The requested URL was not found.`;
      } else if (error.status === 500) {
        errorMessage = 'Internal Server Error (500): Something went wrong on the server.';
      } else {
        errorMessage = `Error (${error.status}): ${error.error?.message || error.message}`;
      }

      notification.showError(errorMessage);
      return throwError(() => error);
    })
  );
};
