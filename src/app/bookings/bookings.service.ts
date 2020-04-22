import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject } from 'rxjs';
import { take, tap, delay, switchMap, map } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { HttpClient } from '@angular/common/http';

interface BookingData {
  bookedFrom: string;
  bookedTo: string;
  firstName: string;
  guestNumber: number;
  lastName: string;
  placeId: string;
  placeImage: string;
  placeTitle: string;
  userId: string;
}

@Injectable({
    providedIn: 'root'
})
export class BookingsService {
  API_URL = 'https://ionic-course-backend.firebaseio.com/';
  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService,
              private http: HttpClient) { }

  get bookings() {
    return this._bookings.asObservable();
  }

  fetchBookings() {
    return this.http.get<{[key: string]: BookingData}>(`${this.API_URL}bookings.json?orderBy="userId"&equalTo="${this.authService.userId}"`)
      .pipe(
        map(bookingData => {
          const bookings = [];
          for (const key in bookingData) {
            if (bookingData.hasOwnProperty(key)) {
              bookings.push(new Booking(key,
                bookingData[key].placeId,
                bookingData[key].userId,
                bookingData[key].placeTitle,
                bookingData[key].placeImage,
                bookingData[key].firstName,
                bookingData[key].lastName,
                bookingData[key].guestNumber,
                new Date(bookingData[key].bookedFrom),
                new Date(bookingData[key].bookedTo)));
            }
          }
          return bookings;
        }),
        tap(bookings => this._bookings.next(bookings))
      );
  }

  addBooking(
      placeId: string,
      placeTitle: string,
      placeImage: string,
      firstName: string,
      lastName: string,
      guestNumber: number,
      dateFrom: Date,
      dateTo: Date) {
    const newBooking = new Booking(
      Math.random.toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo);
    let generatedId: string;
    return this.http.post<{name: string}>(`${this.API_URL}bookings.json`, {...newBooking, id: null})
      .pipe(
        switchMap(resData => {
          generatedId = resData.name;
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          newBooking.id = generatedId;
          this._bookings.next(bookings.concat(newBooking));
        })
      );
  }

  cancelBooking(bookingId: string) {
    return this.http.delete(`${this.API_URL}bookings/${bookingId}.json`)
      .pipe(
        switchMap(() => {
          return this.bookings;
        }),
        take(1),
        tap(bookings => {
          this._bookings.next(bookings.filter(b => b.id !== bookingId));
        })
    );
  }
}
