import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ModalController, ActionSheetController, AlertController } from '@ionic/angular';
import { MapModelComponent } from '../../map-model/map-model.component';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, switchMap } from 'rxjs/operators';
import { PlaceLocation, Coordinates } from 'src/app/places/location.model';
import { of } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {
  @Input() showPreview = false;
  @Output() locationPick = new EventEmitter<PlaceLocation>();
  selectedLocationImage: string;
  isLoading = false;
  constructor(private modalController: ModalController,
              private http: HttpClient,
              private actionSheetController: ActionSheetController,
              private alertController: AlertController) { }

  ngOnInit() {}

  onPickLocation() {
    this.actionSheetController.create({
      header: 'Please Choose',
      buttons: [
        {
          text: 'Auto-Locate',
          handler: () => this.locateUser(),
        }, 
        {
          text: 'Pick on Map',
          handler: () => this.openMap(),
        },
        {
          text: 'Cancel',
          role: 'cancel',
        }
      ]
    }).then(actionSheedEl => {
      actionSheedEl.present();
    });
  }

  private locateUser() {
    if (!Capacitor.isPluginAvailable('Geolocation')) {
      this.showLocationErrorAlert();
      return;
    }
    this.isLoading = true;
    Plugins.Geolocation.getCurrentPosition()
      .then(geoPosition => {
        const coordinates: Coordinates = {
          lat: geoPosition.coords.latitude,
          lng: geoPosition.coords.longitude 
        };
        this.createPlace(coordinates.lat, coordinates.lng);
        this.isLoading = false;
      })
      .catch(err => {
        this.isLoading = false;
        this.showLocationErrorAlert();
      });
  }

  private showLocationErrorAlert() {
    this.alertController.create({
      header: 'Could not fetch location',
      message: 'Please use the map to pick a location!',
      buttons: ['Okay']
    }).then(alertEl => alertEl.present());
  }

  private openMap() {
    this.modalController.create({
      component: MapModelComponent
    }).then(modalEl => {
      modalEl.onDidDismiss().then(result => {
        if (!result.data) {
          return;
        }
        const coordinates: Coordinates = {
          lat: result.data.lat,
          lng: result.data.lng
        };
        this.createPlace(coordinates.lat, coordinates.lng);
      });
      modalEl.present();
    });
  }

  private createPlace(lat: number, lng: number) {
    const pickedLocation: PlaceLocation = {
      lat: lat,
      lng: lng,
      address: null,
      staticMapImageUrl: null
    };
    this.isLoading = true;
    this.getAddress(lat, lng)
      .pipe(
        switchMap(address => {
          pickedLocation.address = address;
          return of(this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14));
        })
    ).subscribe(staticMapImageUrl => {
      pickedLocation.staticMapImageUrl = staticMapImageUrl;
      this.selectedLocationImage = staticMapImageUrl;
      this.isLoading = false;
      this.locationPick.emit(pickedLocation);
    });
  }

  private getAddress(lat: number, lng: number) {
    return this.http.get<any>(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${environment.googleMapsAPIKey}`)
      .pipe(map(geoData => {
        if (!geoData || !geoData.results || geoData.results.length === 0) {
          return null;
        }
        return geoData.results[0].formatted_address;
      }));
  }

  private getMapImage(lat: number, lng: number, zoom: number) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
      &markers=color:red%7Clabel:Place%7C${lat},${lng}
      &key=${environment.googleMapsAPIKey}`; // La url retorna la imagen
  }
}
