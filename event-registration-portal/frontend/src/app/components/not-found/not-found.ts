import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container d-flex flex-column align-items-center justify-content-center text-center min-vh-100 py-5">
      <div class="mb-4">
        <!-- SVG 404 Illustration -->
        <i class="bi bi-exclamation-octagon text-danger display-1 animate-pulse"></i>
      </div>
      <h1 class="display-3 fw-extrabold text-dark mb-2">404 Error</h1>
      <h3 class="fw-bold text-muted mb-3">Page Not Found</h3>
      <p class="text-muted max-width-md mb-4 px-3" style="max-width: 480px;">
        The requested URL was not found on this server. Check your link spelling or navigate back to the main portal.
      </p>
      <a routerLink="/" class="btn btn-primary px-4 py-2.5 rounded-3 d-inline-flex align-items-center gap-2">
        <i class="bi bi-house-door-fill"></i> Back to Dashboard
      </a>
    </div>
  `,
  styles: [`
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: .7;
        transform: scale(0.95);
      }
    }
  `]
})
export class NotFoundComponent {}
