import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, timeout } from 'rxjs/operators';
import { Registration } from '../models/registration.model';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private apiUrl = `${API_BASE_URL}/registrations`;

  constructor(private http: HttpClient) {
    if (!localStorage.getItem('mock_registrations')) {
      localStorage.setItem('mock_registrations', JSON.stringify([]));
    }
  }

  private getMockRegistrations(): Registration[] {
    const str = localStorage.getItem('mock_registrations');
    return str ? JSON.parse(str) : [];
  }

  register(registration: Registration): Observable<Registration> {
    return this.http.post<Registration>(this.apiUrl, registration).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Creating registration locally.');
        const mockRegs = this.getMockRegistrations();
        const newReg = { ...registration, registrationId: Math.floor(Math.random() * 1000) + 10, registrationDate: new Date().toISOString().split('T')[0] };
        mockRegs.push(newReg);
        localStorage.setItem('mock_registrations', JSON.stringify(mockRegs));
        return of(newReg);
      })
    );
  }

  getAll(): Observable<Registration[]> {
    return this.http.get<Registration[]>(this.apiUrl).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Fetching registrations locally.');
        return of(this.getMockRegistrations());
      })
    );
  }

  getByEvent(eventId: number): Observable<Registration[]> {
    return this.http.get<Registration[]>(`${this.apiUrl}/event/${eventId}`).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Fetching registrations locally.');
        const mockRegs = this.getMockRegistrations();
        return of(mockRegs.filter(r => String(r.event?.eventId || (r as any).eventId) === String(eventId)));
      })
    );
  }

  getById(id: number): Observable<Registration> {
    return this.http.get<Registration>(`${this.apiUrl}/${id}`).pipe(
      timeout(2000),
      catchError(err => {
        const mockRegs = this.getMockRegistrations();
        const reg = mockRegs.find(r => String(r.registrationId) === String(id));
        if (reg) return of(reg);
        return throwError(() => new Error('Registration not found'));
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      timeout(2000),
      catchError(err => {
        const mockRegs = this.getMockRegistrations();
        const filtered = mockRegs.filter(r => String(r.registrationId) !== String(id));
        localStorage.setItem('mock_registrations', JSON.stringify(filtered));
        return of(undefined);
      })
    );
  }
}
