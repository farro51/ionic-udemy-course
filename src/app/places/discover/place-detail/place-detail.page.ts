import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, ModalController, ActionSheetController, LoadingController, AlertController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';
import { Subscription } from 'rxjs';
import { BookingsService } from '../../../bookings/bookings.service';
import { AuthService } from '../../../auth/auth.service';
import { MapModelComponent } from 'src/app/shared/map-model/map-model.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit, OnDestroy {
  place: Place;
  isBookable = false;
  isLoading = false;
  private placeSub: Subscription;
  constructor(private navCtrl: NavController,
              private modalCtrl: ModalController,
              private actionSheetController: ActionSheetController,
              private activatedRoute: ActivatedRoute,
              private placesService: PlacesService,
              private bookingsService: BookingsService,
              private loadingController: LoadingController,
              private authService: AuthService,
              private alertController: AlertController,
              private router: Router) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (!params.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
      }
      this.isLoading = true;
      this.placeSub = this.placesService.getPlace(params.get('placeId'))
        .subscribe(place => {
          this.place = place;
          this.isBookable = place.userId !== this.authService.userId;
          this.isLoading = false;
        }, error => {
          this.alertController.create({
            header: 'An error ocurred!',
            message: 'Could not load place.',
            buttons: [{
              text: 'Okay',
              handler: () => this.router.navigate(['/places/tabs/discover'])
            }]
          }).then(alertEl => alertEl.present());
        }
      );
    });
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/discover');
    // Hace el efecto de q esta regresando a la pagina anterior y no creando una nueva
    //this.navCtrl.navigateBack('/places/tabs/discover'); Se devuelve con el efeto back
    //this.navCtrl.pop(); Solo cuando es garantizado q hay una página previa
    this.actionSheetController.create({
      header: 'Choose an Action',
      buttons: [
        {
          text: 'Select Date',
          handler: () => this.openBookingModal('select')
        },
        {
          text: 'Random Date',
          handler: () => this.openBookingModal('random')
        },
        {
          text: 'Cancel',
          role: 'cancel' // 'destructive' pone el boton rojo
        }
      ]
    }).then(actionSheetEl => actionSheetEl.present());
  }

  openBookingModal(mode: 'select' | 'random') {
    console.log(mode);
    this.modalCtrl.create({
      component: CreateBookingComponent,
      componentProps: {
        selectedPlace: this.place,
        selectedMode: mode
      }
    }).then(modal => {
      modal.present();
      return modal.onDidDismiss();
    }).then(resultData => {
      if (resultData.role === 'confirm') {
        this.loadingController.create({
          message: 'Booking place...'
        }).then(loadingEl => {
          loadingEl.present();
          const data = resultData.data.bookingData;
          this.bookingsService.addBooking(
            this.place.id,
            this.place.title,
            this.place.imageUrl,
            data.firstName,
            data.lastName,
            data.guestNumber,
            data.startDate,
            data.endDate
          ).subscribe(() => {
            loadingEl.dismiss();
          });
        });
      }
    });
  }

  onShowFullMap() {
    this.modalCtrl.create({
      component: MapModelComponent,
      componentProps: {
        center: {
          lat: this.place.location.lat,
          lng: this.place.location.lng
        },
        selectable: false,
        closeButtonText: 'Close',
        title: this.place.location.address
      }
    }).then(modalEl => modalEl.present());
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
