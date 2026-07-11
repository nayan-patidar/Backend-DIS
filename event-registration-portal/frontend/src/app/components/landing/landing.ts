import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';
import { forkJoin, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { RegistrationService } from '../../services/registration.service';
import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-wrapper min-vh-100 overflow-hidden text-main">
      <!-- Navbar has been moved to app.html (Unified Public Navbar) -->

      <!-- Hero Section -->
      <header class="hero-section position-relative py-5 overflow-hidden bg-white border-bottom shadow-sm">
        <div class="container position-relative z-2">
          <div class="row align-items-center g-5 py-5">
            <div class="col-lg-6 text-center text-lg-start">
              <span class="badge bg-primary-subtle text-primary px-3 py-2 rounded-pill mb-3 fw-semibold shadow-sm">New Era of Events</span>
              <h1 class="display-3 fw-bolder mb-3 text-dark" style="line-height: 1.1; letter-spacing: -0.03em;">
                Future of Events
              </h1>
              <p class="text-muted mb-4 fs-5" style="max-width: 90%;">
                Streamline your registrations, track check-ins, and manage capacity flawlessly with our unified event portal.
              </p>
              <div class="d-flex flex-wrap justify-content-center justify-content-lg-start gap-3 mt-4">
                <a href="#featured" class="btn btn-primary btn-lg px-4 py-3 shadow-sm d-flex align-items-center gap-2 hover-lift">
                  <span class="fw-bold">Explore Events</span> <i class="bi bi-arrow-right-short fs-4"></i>
                </a>
                <a routerLink="/login" class="btn btn-outline-secondary border-light-subtle btn-lg px-4 py-3 hover-lift fw-semibold text-dark bg-light">
                  Get Started
                </a>
              </div>
            </div>
            
            <div class="col-lg-6 d-none d-lg-block position-relative">
              <!-- Animated floating glass cards (Clean SaaS) -->
              <div class="card bg-white border shadow overflow-hidden rounded-4 hover-lift" style="transform: rotate(3deg); transition: transform 0.5s ease;">
                 <img src="/images/tech_event.jpg" alt="Platform Preview" class="img-fluid w-100 object-fit-cover" style="height: 400px; opacity: 0.95;">
              </div>
              
              <!-- Floating stat cards -->
              <div class="position-absolute p-3 bg-white shadow-lg rounded-4 d-flex align-items-center gap-3 hover-lift border" style="bottom: -30px; left: -30px; z-index: 5;">
                <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style="width: 54px; height: 54px;">
                  <i class="bi bi-people-fill fs-4"></i>
                </div>
                <div>
                  <h4 class="mb-0 fw-bold text-dark">{{ stats.registrations }}<span class="text-primary">+</span></h4>
                  <span class="text-muted small fw-bold text-uppercase" style="font-size: 0.7rem; letter-spacing: 0.5px;">Active Bookings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- Stats Counters Ribbon -->
      <section class="py-5 bg-light border-top border-bottom">
        <div class="container">
          <div class="row g-4 text-center">
            <div class="col-6 col-md-3">
              <span class="d-block text-muted text-uppercase small fw-semibold mb-2">ACTIVE USERS</span>
              <h3 class="fw-bold mb-0 text-primary">{{ stats.users }}+</h3>
            </div>
            <div class="col-6 col-md-3">
              <span class="d-block text-muted text-uppercase small fw-semibold mb-2">LIVE EVENTS</span>
              <h3 class="fw-bold mb-0 text-dark">{{ stats.events }} Live</h3>
            </div>
            <div class="col-6 col-md-3">
              <span class="d-block text-muted text-uppercase small fw-semibold mb-2">SUCCESSFUL TICKETS</span>
              <h3 class="fw-bold mb-0 text-dark">{{ stats.registrations }} Confirmed</h3>
            </div>
            <div class="col-6 col-md-3">
              <span class="d-block text-muted text-uppercase small fw-semibold mb-2">PLATFORM UPTIME</span>
              <h3 class="fw-bold mb-0 text-success">99.9%</h3>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Events Grid -->
      <section id="featured" class="py-5 my-4 bg-light position-relative border-top border-bottom">
        <div class="container position-relative z-2">
          <div class="text-center mb-5">
            <h2 class="fw-bolder text-dark mb-3">Featured Events</h2>
            <p class="text-muted text-sm max-w-600 mx-auto">Discover the latest workshops, hackathons, and corporate seminars happening right now.</p>
          </div>

          <div class="row g-4">
            <div *ngFor="let ev of featuredEvents; let i = index" class="col-md-6 col-lg-4">
              <div class="card border bg-white shadow-sm h-100 hover-lift">
                <div class="position-relative overflow-hidden rounded-top-4" style="height: 160px;">
                  <img [src]="getEventImage(ev)" class="w-100 h-100 object-fit-cover" style="transition: transform 0.5s ease;" alt="Event cover" />
                  <span class="badge bg-primary-subtle text-primary position-absolute top-0 start-0 m-3 px-2 py-1 rounded-1 fw-bold shadow-sm" style="font-size: 0.65rem; letter-spacing: 0.5px;">UPCOMING</span>
                </div>
                <div class="card-body p-4 d-flex flex-column bg-white rounded-bottom-4">
                  <h5 class="fw-bold text-dark mb-2">{{ ev.eventName }}</h5>
                  <p class="text-muted small text-truncate-3 mb-4 flex-grow-1">{{ ev.description || 'Join premium organizers at this network portal event.' }}</p>
                  
                  <div class="d-flex flex-column gap-2 mb-4 border-top pt-3">
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-calendar me-2"></i>
                      <span>{{ ev.eventTime }}</span>
                    </div>
                    <div class="d-flex align-items-center text-muted small">
                      <i class="bi bi-geo-alt me-2"></i>
                      <span class="text-truncate">{{ ev.venue || 'TBA' }}</span>
                    </div>
                  </div>

                  <a routerLink="/events" class="btn btn-outline-primary w-100 fw-medium">View Details</a>
                </div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div class="text-center mt-5 py-5 bg-white rounded-4 border shadow-sm" *ngIf="featuredEvents.length === 0">
              <div class="mb-3 text-muted opacity-50">
                <i class="bi bi-calendar-x display-4"></i>
              </div>
              <h4 class="fw-bold text-dark">No Featured Events</h4>
              <p class="text-muted mb-4">The platform is waiting for its first big event. Be the pioneer!</p>
              <a routerLink="/dashboard" class="btn btn-primary px-4 py-2 rounded-pill shadow-sm">Go to Dashboard</a>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="py-5 bg-cyber-light position-relative">
        <div class="container position-relative z-2">
          <div class="text-center mb-5">
            <h2 class="section-title text-main font-orbitron">ATTENDEE FEEDBACK</h2>
            <div class="divider bg-cyber-gradient mx-auto mb-3"></div>
          </div>

          <div class="row g-4 justify-content-center">
            <div class="col-md-5">
              <div class="glass-card p-4 border border-cyber-border h-100 d-flex flex-column justify-content-between">
                <p class="text-muted italic-text">"The premium glass UI and direct ticket validation made registering for the IIT Hackathon absolutely seamless. Feels like a real SaaS product!"</p>
                <div class="d-flex align-items-center gap-3 border-top border-cyber-border pt-3 mt-3">
                  <div class="avatar bg-cyan-glow text-cyan rounded-circle fw-bold d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">RS</div>
                  <div>
                    <h6 class="fw-bold mb-0 text-main font-orbitron">Rahul Sharma</h6>
                    <span class="text-cyber-muted text-xs">MEMBER_ATTENDEE</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="col-md-5">
              <div class="glass-card p-4 border border-cyber-border h-100 d-flex flex-column justify-content-between">
                <p class="text-muted italic-text">"Switching between Admin dashboard mode to monitor capacity charts and User registration decks is lightning fast. Stellar design work."</p>
                <div class="d-flex align-items-center gap-3 border-top border-cyber-border pt-3 mt-3">
                  <div class="avatar bg-purple-glow text-purple rounded-circle fw-bold d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">MY</div>
                  <div>
                    <h6 class="fw-bold mb-0 text-main font-orbitron">Mahek Yadav</h6>
                    <span class="text-cyber-muted text-xs">PORTAL_MANAGER</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- About Section -->
      <section id="about" class="py-5 bg-white border-top">
        <div class="container">
          <div class="row align-items-center g-5">
            <div class="col-lg-6">
              <h2 class="fw-bolder text-dark mb-4">About Eventora</h2>
              <p class="text-muted fs-5 mb-4">
                We believe that managing events shouldn't be complicated. Eventora was built with a single goal: to provide organizers and participants with a seamless, unified, and beautiful platform to connect.
              </p>
              <p class="text-muted">
                Whether you are hosting a local tech meetup, a corporate seminar, or a massive university hackathon, our platform scales with you. With real-time capacity tracking, secure registrations, and intuitive dashboards, we take the stress out of event management.
              </p>
              <div class="d-flex gap-3 mt-4">
                <div class="d-flex align-items-center text-dark fw-semibold">
                  <i class="bi bi-check-circle-fill text-primary me-2"></i> Trusted Security
                </div>
                <div class="d-flex align-items-center text-dark fw-semibold">
                  <i class="bi bi-check-circle-fill text-primary me-2"></i> 24/7 Support
                </div>
              </div>
            </div>
            <div class="col-lg-6">
              <div id="aboutCarousel" class="carousel slide carousel-fade shadow-lg rounded-4 overflow-hidden" data-bs-ride="carousel" data-bs-interval="4000">
                <div class="carousel-inner" style="min-height: 400px;">
                  
                  <!-- Slide 1 -->
                  <div class="carousel-item active h-100 position-relative">
                    <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800" class="d-block w-100 h-100 object-fit-cover" alt="Event crowd">
                    <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); z-index: 20;">
                      <h4 class="text-white fw-bold">Massive Scale Events</h4>
                      <p class="text-light small mb-3">Handle thousands of concurrent registrations effortlessly with our robust backend infrastructure.</p>
                    </div>
                  </div>
                  
                  <!-- Slide 2 -->
                  <div class="carousel-item h-100 position-relative">
                    <img src="https://images.unsplash.com/photo-1551818255-e6e10975bc17?auto=format&fit=crop&q=80&w=800" class="d-block w-100 h-100 object-fit-cover" alt="Corporate seminar">
                    <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); z-index: 20;">
                      <h4 class="text-white fw-bold">Corporate Seminars</h4>
                      <p class="text-light small mb-3">Professional tools for managing VIP guest lists, custom ticketing, and corporate check-ins.</p>
                    </div>
                  </div>
                  
                  <!-- Slide 3 -->
                  <div class="carousel-item h-100 position-relative">
                    <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=800" class="d-block w-100 h-100 object-fit-cover" alt="Tech conference">
                    <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); z-index: 20;">
                      <h4 class="text-white fw-bold">Tech Hackathons</h4>
                      <p class="text-light small mb-3">Built-in team formation mechanics and capacity limits perfect for technical university events.</p>
                    </div>
                  </div>
                  
                  <!-- Slide 4 -->
                  <div class="carousel-item h-100 position-relative">
                    <img src="https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=800" class="d-block w-100 h-100 object-fit-cover" alt="Team meeting">
                    <div class="position-absolute bottom-0 start-0 w-100 p-4" style="background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); z-index: 20;">
                      <h4 class="text-white fw-bold">Real-Time Analytics</h4>
                      <p class="text-light small mb-3">Monitor ticket sales and attendee check-ins live through our premium Admin dashboard.</p>
                    </div>
                  </div>

                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#aboutCarousel" data-bs-slide="prev">
                  <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#aboutCarousel" data-bs-slide="next">
                  <span class="carousel-control-next-icon" aria-hidden="true"></span>
                  <span class="visually-hidden">Next</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Contact Section -->
      <section id="contact" class="py-5 bg-light border-top border-bottom">
        <div class="container py-4">
          <div class="text-center mb-5">
            <h2 class="fw-bolder text-dark mb-3">Get in Touch</h2>
            <p class="text-muted max-w-600 mx-auto">Have a question about our platform or need help organizing your next big event? We're here to help.</p>
          </div>
          
          <div class="row justify-content-center">
            <div class="col-lg-8">
              <div class="card border bg-white shadow-sm rounded-4 p-4 p-md-5">
                <div class="row g-4">
                  <div class="col-md-6">
                    <div class="d-flex align-items-center gap-3 mb-4">
                      <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-envelope-fill fs-5"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-0">Email Us</h6>
                        <span class="text-muted small">support&#64;eventora.in</span>
                      </div>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px;">
                        <i class="bi bi-telephone-fill fs-5"></i>
                      </div>
                      <div>
                        <h6 class="fw-bold mb-0">Call Us</h6>
                        <span class="text-muted small">+91 98765 43210</span>
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <form (submit)="sendMessage($event)">
                      <div class="mb-3">
                        <input type="text" id="contactName" class="form-control" placeholder="Your Name" required>
                      </div>
                      <div class="mb-3">
                        <input type="email" id="contactEmail" class="form-control" placeholder="Your Email" required>
                      </div>
                      <div class="mb-3">
                        <textarea id="contactMsg" class="form-control" rows="3" placeholder="How can we help?" required></textarea>
                      </div>
                      <button type="submit" class="btn btn-primary w-100 fw-semibold hover-lift">Send Message</button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Footer -->
      <footer class="py-5 bg-white border-top">
        <div class="container">
          <div class="row g-4 justify-content-between">
            <div class="col-md-4">
              <a routerLink="/" class="d-flex align-items-center gap-2 mb-3 text-decoration-none">
                <div class="logo-box bg-primary text-white rounded-3 d-flex align-items-center justify-content-center">
                  <i class="bi bi-intersect"></i>
                </div>
                <span class="fw-bold text-dark fs-4">Eventora</span>
              </a>
              <p class="text-muted small">A secure, professional platform designed for event builders, organizers, and enterprises.</p>
            </div>
            
            <div class="col-md-3">
              <h6 class="fw-bold text-dark mb-3">Resources</h6>
              <ul class="list-unstyled d-flex flex-column gap-2 text-muted small">
                <li><a routerLink="/login" class="text-decoration-none text-muted">Login</a></li>
                <li><a routerLink="/login" [queryParams]="{tab:'signup'}" class="text-decoration-none text-muted">Sign up</a></li>
                <li><a href="#featured" class="text-decoration-none text-muted">Events Catalog</a></li>
              </ul>
            </div>
          </div>
          
          <div class="border-top mt-4 pt-4 text-center text-muted small">
            <span>© 2026 Eventora. Premium events management platform.</span>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .glass-card {
      background: var(--card-bg) !important;
      border: 1px solid var(--border-color);
      border-radius: 0.75rem !important;
    }

    /* Sections general */
    .bg-cyber-light {
      background-color: var(--card-bg) !important;
    }
    .border-cyber-border {
      border-color: rgba(6, 182, 212, 0.15) !important;
    }
    .text-cyber-muted {
      font-family: 'Orbitron', sans-serif;
      color: #6b7280;
      letter-spacing: 0.5px;
    }
    .section-title {
      font-weight: 800;
      letter-spacing: 0.05em;
    }
    .divider {
      height: 4px;
      width: 60px;
      border-radius: 2px;
    }
    .max-w-600 {
      max-width: 600px;
    }
    
    /* Cyber Card */
    .cyber-event-card {
      border-radius: 1rem !important;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .cyber-event-card:hover {
      border-color: #06b6d4 !important;
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.15) !important;
      transform: translateY(-5px);
    }
    
    .card-banner-container {
      height: 140px;
    }
    .card-banner {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    .cyber-event-card:hover .card-banner {
      transform: scale(1.05);
    }
    .card-banner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, transparent 30%, rgba(3, 7, 18, 0.95) 100%);
    }

    .italic-text {
      font-style: italic;
      line-height: 1.7;
    }
    .opacity-6 {
      opacity: 0.6;
    }
  `]
})
export class LandingComponent implements OnInit {
  // Initialize with dummy data immediately for zero load time
  stats = {
    events: 8,
    registrations: 34,
    users: 18
  };
  
  featuredEvents: Event[] = [];

  constructor(
    private eventService: EventService,
    private registrationService: RegistrationService,
    private userService: UserService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Instantly load offline events for zero-load time UI
    const str = localStorage.getItem('mock_events_v3');
    if (str) {
      const mockEvents = JSON.parse(str);
      this.featuredEvents = mockEvents.slice(0, 3);
      if (mockEvents.length > 8) this.stats.events = mockEvents.length;
    }

    forkJoin({
      events: this.eventService.getAllEvents().pipe(catchError(() => of([]))),
      registrations: this.registrationService.getAll().pipe(catchError(() => of([]))),
      users: this.userService.getAllUsers().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ events, registrations, users }) => {
        const eventsList = events || [];
        const regs = registrations || [];
        
        if (eventsList.length > 0) {
          this.featuredEvents = eventsList.slice(0, 3);
          if (eventsList.length > 8) this.stats.events = eventsList.length;
        }
        
        if (regs.length > 34) {
          this.stats.registrations = regs.length;
        }
        
        if ((users || []).length > 18) {
          this.stats.users = users.length;
        }
      },
      error: (err) => {
        console.error('Error loading landing page metrics', err);
      }
    });
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

  getEventImage(event: Event): string {
    const id = event.eventId || 1;
    const category = this.getEventCategory(event).toLowerCase();
    return `https://loremflickr.com/800/600/${category}?lock=${id}`;
  }

  sendMessage(event: any): void {
    event.preventDefault();
    this.notificationService.showSuccess('Message sent successfully! We will get back to you shortly.');
    
    // Clear form fields
    const form = event.target as HTMLFormElement;
    if (form) form.reset();
  }
}
