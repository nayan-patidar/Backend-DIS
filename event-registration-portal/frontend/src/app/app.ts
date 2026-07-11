import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService, AlertMessage } from './services/notification.service';
import { UserService } from './services/user.service';
import { filter } from 'rxjs/operators';
import { User } from './models/user.model';

interface Breadcrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  alerts: AlertMessage[] = [];
  sidebarCollapsed = false;
  showProfileMenu = false;
  breadcrumbs: Breadcrumb[] = [];
  currentPageTitle = 'Dashboard';
  isDarkMode = true;

  currentRole: 'ADMIN' | 'PARTICIPANT' = 'ADMIN';
  currentUserId = 2; // Default mock participant user ID
  currentUserName = 'System Admin';
  currentUserEmail = 'admin@gmail.com';
  usersList: User[] = [];
  globalSearchQuery: string = '';

  isAuthPage = false;
  isLandingPage = false;

  constructor(
    private notification: NotificationService,
    private userService: UserService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return !!localStorage.getItem('current_user_id') && !this.router.url.includes('/login');
  }

  ngOnInit() {
    this.notification.alerts$.subscribe(alerts => {
      this.alerts = alerts;
    });

    // Load active theme
    const savedTheme = localStorage.getItem('dark_theme');
    this.isDarkMode = savedTheme !== 'false'; // Default to true
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
    }

    // UI State check
    const savedUserId = localStorage.getItem('current_user_id');
    const isLoginPath = window.location.pathname.includes('/login') || this.router.url.includes('/login');
    
    this.isAuthPage = isLoginPath;
    this.isLandingPage = window.location.pathname === '/' || window.location.pathname === '';

    if (!savedUserId) {
      // Logged out public user defaults to participant view modes
      this.currentRole = 'PARTICIPANT';
      localStorage.setItem('current_role', 'PARTICIPANT');
    } else {
      this.initSession(savedUserId);
    }

    // Listen to routing events to set breadcrumbs and page title
    this.updateNavigationState(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const currentId = localStorage.getItem('current_user_id');
      const isLogin = event.urlAfterRedirects.includes('/login');

      this.isAuthPage = isLogin;
      this.isLandingPage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '';

      if (currentId && isLogin) {
        this.router.navigate(['/dashboard']);
      }
      
      // Sync state if it changed from another component (like auth login)
      if (currentId) {
        const savedRole = localStorage.getItem('current_role');
        if (savedRole && savedRole !== this.currentRole) {
          this.initSession(currentId);
        } else if (currentId !== String(this.currentUserId)) {
          this.initSession(currentId);
        }
      }

      this.updateNavigationState(event.urlAfterRedirects);
    });
  }

  private initSession(savedUserId: string) {
    const savedRole = localStorage.getItem('current_role');
    if (savedRole === 'ADMIN' || savedRole === 'PARTICIPANT') {
      this.currentRole = savedRole;
    } else {
      localStorage.setItem('current_role', 'ADMIN');
      this.currentRole = 'ADMIN';
    }

    if (savedUserId) {
      this.currentUserId = +savedUserId;
    } else {
      if (this.currentRole === 'ADMIN') {
        this.currentUserId = 1;
        localStorage.setItem('current_user_id', '1');
      } else {
        this.currentUserId = 2;
        localStorage.setItem('current_user_id', '2');
      }
    }

    this.loadProfileDetails();
  }

  loadProfileDetails() {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.usersList = users || [];
        
        const user = this.usersList.find(u => u.userId === this.currentUserId);
        
        if (user) {
          this.currentUserName = user.name;
          this.currentUserEmail = user.email;
        } else {
          // Fallbacks if user not found in the list
          if (this.currentRole === 'ADMIN') {
            this.currentUserName = 'System Admin';
            this.currentUserEmail = 'admin@gmail.com';
          } else {
            this.currentUserName = 'Jane Doe';
            this.currentUserEmail = 'jane.doe@example.com';
          }
        }
      },
      error: (err) => {
        console.error('Error fetching users for layout profile', err);
      }
    });
  }

  switchRole(role: 'ADMIN' | 'PARTICIPANT') {
    this.currentRole = role;
    localStorage.setItem('current_role', role);
    
    if (role === 'ADMIN') {
      localStorage.setItem('current_user_id', '1');
    } else {
      localStorage.setItem('current_user_id', '2'); // Default to Rahul
    }

    this.showProfileMenu = false;
    this.notification.showSuccess(`Switched view to: ${role} Mode`);
    
    // Reload page to force components refresh their context matching the switched role
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  switchParticipantUser(userId: number) {
    this.currentUserId = userId;
    localStorage.setItem('current_user_id', String(userId));
    const u = this.usersList.find(usr => usr.userId === userId);
    if (u) {
      this.currentUserName = u.name;
      this.currentUserEmail = u.email;
    }
    this.showProfileMenu = false;
    this.notification.showSuccess(`Switched active user: ${this.currentUserName}`);
    setTimeout(() => {
      window.location.reload();
    }, 800);
  }

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    if (this.isDarkMode) {
      document.body.classList.add('dark-theme');
      localStorage.setItem('dark_theme', 'true');
    } else {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('dark_theme', 'false');
    }
  }

  onGlobalSearch() {
    if (this.globalSearchQuery && this.globalSearchQuery.trim()) {
      this.router.navigate(['/events'], { queryParams: { search: this.globalSearchQuery.trim() } });
      this.globalSearchQuery = '';
    }
  }

  logout() {
    if (confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('current_role');
      localStorage.removeItem('current_user_id');
      localStorage.removeItem('auth_token');
      this.notification.showInfo('Logged out successfully.');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  toggleProfileMenu() {
    this.showProfileMenu = !this.showProfileMenu;
  }

  removeAlert(alert: AlertMessage) {
    this.notification.removeAlert(alert);
  }

  getInitials(name?: string): string {
    if (!name) return 'AD';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private updateNavigationState(url: string) {
    const path = url.split('?')[0]; // strip query params
    this.breadcrumbs = [{ label: 'Home', url: '/' }];
    
    if (path === '/' || path === '') {
      this.currentPageTitle = 'Dashboard';
    } else if (path.startsWith('/events/create')) {
      this.currentPageTitle = 'Create Event';
      this.breadcrumbs.push({ label: 'Events', url: '/events' });
      this.breadcrumbs.push({ label: 'Create New', url: '/events/create' });
    } else if (path.startsWith('/events')) {
      this.currentPageTitle = 'Events Directory';
      this.breadcrumbs.push({ label: 'Events', url: '/events' });
    } else if (path.startsWith('/register-participant')) {
      this.currentPageTitle = 'Register Participant';
      this.breadcrumbs.push({ label: 'Register', url: '/register-participant' });
    } else if (path.startsWith('/participants')) {
      this.currentPageTitle = this.currentRole === 'ADMIN' ? 'Registrations Directory' : 'My Registrations';
      this.breadcrumbs.push({ label: 'Registrations', url: '/participants' });
    } else {
      this.currentPageTitle = 'Portal';
    }
  }
}
