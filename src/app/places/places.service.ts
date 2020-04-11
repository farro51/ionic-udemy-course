import { Injectable } from '@angular/core';
import { Place } from './place.model';

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private _places: Place[] = [
    new Place('p1',
      'Manhattan Mansion',
      'In the heart of New York City.',
      'https://i.pinimg.com/originals/69/c2/23/69c223ff61fb4160044e5ba1e9e23d05.jpg',
      149.99),
    new Place('p2',
    'L\'Amour Toujours',
      'A romantic place in Paris!.',
      'https://media-cdn.tripadvisor.com/media/photo-s/16/0b/96/09/hotel-amour.jpg',
      189.99),
    new Place('p3',
      'The Foggy Palace',
      'Not your average city trip!',
      'https://static1.bigstockphoto.com/0/8/1/large1500/180367120.jpg',
      99.99)
  ];

  constructor() { }

  get places() {
    return [...this._places];
  }
}
