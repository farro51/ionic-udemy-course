import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { take, map, tap, delay } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([
    new Place('p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://i.pinimg.com/originals/69/c2/23/69c223ff61fb4160044e5ba1e9e23d05.jpg',
      149.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'),
    new Place('p2',
    'L\'Amour Toujours',
      'A romantic place in Paris!.',
      'https://media-cdn.tripadvisor.com/media/photo-s/16/0b/96/09/hotel-amour.jpg',
      189.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc'),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://static1.bigstockphoto.com/0/8/1/large1500/180367120.jpg',
      99.99,
      new Date('2020-01-01'),
      new Date('2020-12-31'),
      'abc')
  ]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this._places.asObservable();
  }

  getPlace(placeId: string) {
    return this.places.pipe(take(1), map(places => {
      return {...places.find(p => p.id === placeId)};
    }));
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date) {
    const newPlace = new Place(Math.random().toString(), title, description,
      'https://static1.bigstockphoto.com/0/8/1/large1500/180367120.jpg', price, dateFrom, dateTo, this.authService.userId);

    return this.http.post('https://ionic-course-backend.firebaseio.com/offered-places.json', {
      ...newPlace,
      id: null
    }).pipe(tap(resData => {
      console.log(resData);
    }));
    // take sirve para que el subscribe solo se ejecute una vez y se cancele la subscripcion
    // return this.places.pipe(
    //   take(1),
    //   delay(1000),
    //   tap(places => { // Es como el subscribe pero no consume el observable
    //     this._places.next(places.concat(newPlace));
    //   }));
  }

  editPlace(placeId: string, title: string, description: string) {
    return this.places.pipe(
      take(1),
      delay(1000),
      map(places => {
        const place = places.find(p => p.id === placeId);
        place.title = title;
        place.description = description;
        return {...place};
    }));
  }
}
