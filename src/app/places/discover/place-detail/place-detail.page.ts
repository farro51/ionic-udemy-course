import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
})
export class PlaceDetailPage implements OnInit {

  constructor(private router: Router,
              private navCtrl: NavController) { }

  ngOnInit() {
  }

  onBookPlace() {
    //this.router.navigateByUrl('/places/tabs/discover');
    // Hace el efecto de q esta regresando a la pagina anterior y no creando una nueva
    this.navCtrl.navigateBack('/places/tabs/discover');
    //this.navCtrl.pop(); Solo cuando es garantizado q hay una página previa
  }
}
