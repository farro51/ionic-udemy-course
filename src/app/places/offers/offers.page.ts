import { Component, OnInit, OnDestroy } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.model';
import { IonItemSliding } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss'],
})
export class OffersPage implements OnInit, OnDestroy {

  offers: Place[] = [];
  private placesSub: Subscription;
  constructor(private placesService: PlacesService,
              private router: Router) { }

  ngOnInit() {
    console.log('OnInit');
    this.placesSub = this.placesService.places.subscribe(places => {
      this.offers = places;
      console.log(this.offers);
    });
  }

  ionViewWillEnter() {
    console.log('ionViewWillEnter');
    console.log(this.offers);
  }

  ionViewDidEnter() {
    console.log('ionViewDidEnter');
    console.log(this.offers);
  }

  ionViewWillLeave() {
    console.log('ionViewWillLeave');
    console.log(this.offers);
  }

  ionViewDidLeave() {
    console.log('ionViewDidLeave');
    console.log(this.offers);
  }

  onEdit(offerId: string, slidingItem: IonItemSliding) {
    slidingItem.close();
    this.router.navigate(['/', 'places', 'tabs', 'offers', 'edit', offerId]);
  }

  ngOnDestroy(): void {
    console.log('ngOnDestroy');
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}
