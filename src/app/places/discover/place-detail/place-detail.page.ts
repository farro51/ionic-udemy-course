import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController, ModalController, ActionSheetController } from '@ionic/angular';
import { PlacesService } from '../../places.service';
import { Place } from '../../place.model';
import { CreateBookingComponent } from 'src/app/bookings/create-booking/create-booking.component';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {
  place: Place;
  constructor(private navCtrl: NavController,
              private modalCtrl: ModalController,
              private actionSheetController: ActionSheetController,
              private activatedRoute: ActivatedRoute,
              private placesService: PlacesService) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (!params.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/discover');
      }
      
      this.place = this.placesService.getPlace(params.get('placeId'));
    })
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
        selectedPlace: this.place
      }
    }).then(modal => {
      modal.present();
      return modal.onDidDismiss();
    }).then(resultData => {
      console.log(resultData.data, resultData.role);
      if (resultData.role === 'confirm') {
        console.log('BOOKED!');
      }
    });
  }
}
