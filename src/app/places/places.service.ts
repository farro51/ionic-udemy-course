import { Injectable } from '@angular/core';
import { Place } from './place.model';
import { AuthService } from '../auth/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { take, map, tap, switchMap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { PlaceLocation } from './location.model';


// new Place('p1',
// 'Manhattan Mansion',
// 'In the heart of New York City.',
// 'https://i.pinimg.com/originals/69/c2/23/69c223ff61fb4160044e5ba1e9e23d05.jpg',
// 149.99,
// new Date('2020-01-01'),
// new Date('2020-12-31'),
// 'abc'),
// new Place('p2',
// 'L\'Amour Toujours',
// 'A romantic place in Paris!.',
// 'https://media-cdn.tripadvisor.com/media/photo-s/16/0b/96/09/hotel-amour.jpg',
// 189.99,
// new Date('2020-01-01'),
// new Date('2020-12-31'),
// 'abc'),
// new Place('p3',
// 'The Foggy Palace',
// 'Not your average city trip!',
// 'https://static1.bigstockphoto.com/0/8/1/large1500/180367120.jpg',
// 99.99,
// new Date('2020-01-01'),
// new Date('2020-12-31'),
// 'abc')


interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
  location: PlaceLocation;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places = new BehaviorSubject<Place[]>([]);

  constructor(private authService: AuthService, private http: HttpClient) { }

  get places() {
    return this._places.asObservable();
  }

  fetchPlaces() {
    return this.http
      .get<{[key: string]: PlaceData}>('https://ionic-course-backend.firebaseio.com/offered-places.json')
      .pipe(map(resData => {
        const places = [];
        for (const key in resData) {
          if (resData.hasOwnProperty(key)) {
            places.push(
              new Place(key,
                resData[key].title,
                resData[key].description,
                resData[key].imageUrl,
                resData[key].price,
                new Date(resData[key].availableFrom),
                new Date(resData[key].availableTo),
                resData[key].userId,
                resData[key].location));
          }
        }
        return places;
      }),
      tap(places => {
        this._places.next(places);
      }));
  }

  getPlace(placeId: string) {
    return this.http.get<PlaceData>(`https://ionic-course-backend.firebaseio.com/offered-places/${placeId}.json`)
      .pipe(
        map(resData => {
          return new Place(placeId,
            resData.title,
            resData.description,
            resData.imageUrl,
            resData.price,
            new Date(resData.availableFrom),
            new Date(resData.availableTo),
            resData.userId,
            resData.location);
        })
      );
  }

  addPlace(title: string, description: string, price: number, dateFrom: Date, dateTo: Date, location: PlaceLocation) {
    let generatedId: string;
    const newPlace = new Place(Math.random().toString(), title, description,
      'https://static1.bigstockphoto.com/0/8/1/large1500/180367120.jpg', price,
      dateFrom, dateTo, this.authService.userId, location);

    return this.http.post<{name: string}>('https://ionic-course-backend.firebaseio.com/offered-places.json', {
      ...newPlace,
      id: null
    }).pipe(switchMap(resData => { // Cambia el observable en la cadena
      generatedId = resData.name;
      return this.places;
    }),
    take(1),
    tap(places => {
      newPlace.id = generatedId;
      this._places.next(places.concat(newPlace));
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
    let updatedPlaces: Place[];
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <=0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(p => p.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId,
          oldPlace.location
        );
        return this.http.put(`https://ionic-course-backend.firebaseio.com/offered-places/${placeId}.json`, {...updatedPlaces[updatedPlaceIndex], id: null});
      }),
      tap(() => {
        this._places.next(updatedPlaces);
      })
    );
  }
}
