import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError, timeout } from 'rxjs/operators';
import { Event } from '../models/event.model';
import { API_BASE_URL } from '../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = `${API_BASE_URL}/events`;

  private dummyEvents: Event[] = [
    { eventId: 1, eventName: 'AI Workshop', description: 'Introduction to AI', eventDate: '2026-08-15', eventTime: '10:00:00', venue: 'Seminar Hall', category: 'Technology', status: 'UPCOMING', organizerId: 1 } as Event,
    { eventId: 2, eventName: 'Hackathon', description: '24 Hour Coding', eventDate: '2026-08-16', eventTime: '09:00:00', venue: 'Auditorium', category: 'Technology', status: 'UPCOMING', organizerId: 1 } as Event,
    { eventId: 3, eventName: 'Hackathon', description: '24 Hour Coding', eventDate: '2026-08-17', eventTime: '09:00:00', venue: 'Auditorium', category: 'Technology', status: 'UPCOMING', organizerId: 1 } as Event
  ];

  constructor(private http: HttpClient) {
    if (!localStorage.getItem('mock_events_v3')) {
      localStorage.setItem('mock_events_v3', JSON.stringify(this.dummyEvents));
    }
  }

  private getMockEvents(): Event[] {
    const str = localStorage.getItem('mock_events_v3');
    return str ? JSON.parse(str) : this.dummyEvents;
  }

  createEvent(event: Event): Observable<Event> {
    return this.http.post<Event>(this.apiUrl, event).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Creating event locally in offline database.');
        const mockEvents = this.getMockEvents();
        const newEvent = { ...event, eventId: Math.floor(Math.random() * 1000) + 10 };
        mockEvents.push(newEvent);
        localStorage.setItem('mock_events_v3', JSON.stringify(mockEvents));
        return of(newEvent);
      })
    );
  }

  getAllEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(this.apiUrl).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Fetching events from offline database.');
        return of(this.getMockEvents());
      })
    );
  }

  getEvent(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Fetching event from offline database.');
        const mockEvents = this.getMockEvents();
        const ev = mockEvents.find(e => String(e.eventId) === String(id));
        if (ev) return of(ev);
        return throwError(() => new Error('Event not found'));
      })
    );
  }

  deleteEvent(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      timeout(2000),
      catchError(err => {
        console.warn('Backend offline. Deleting event from offline database.');
        const mockEvents = this.getMockEvents();
        const filtered = mockEvents.filter(e => String(e.eventId) !== String(id));
        localStorage.setItem('mock_events_v3', JSON.stringify(filtered));
        return of('Deleted locally');
      })
    );
  }
}
