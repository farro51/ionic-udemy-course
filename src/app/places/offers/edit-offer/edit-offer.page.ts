import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController, LoadingController } from '@ionic/angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Place } from '../../place.model';
import { PlacesService } from '../../places.service';

@Component({
  selector: 'app-edit-offer',
  templateUrl: './edit-offer.page.html',
  styleUrls: ['./edit-offer.page.scss'],
})
export class EditOfferPage implements OnInit, OnDestroy {
  place: Place;
  form: FormGroup = this.formBuilder.group({
    title: [null, Validators.required],
    description: [null, [Validators.required, Validators.maxLength(180)]]
  });

  private placeSub: Subscription;

  constructor(private activatedRoute: ActivatedRoute,
              private navCtrl: NavController,
              private placesService: PlacesService,
              private formBuilder: FormBuilder,
              private router: Router,
              private loadingController: LoadingController) { }

  ngOnInit() {
    this.activatedRoute.paramMap.subscribe(params => {
      if (!params.has('placeId')) {
        this.navCtrl.navigateBack('/places/tabs/offers');
      }

      this.placesService.getPlace(params.get('placeId')).subscribe(place => {
        this.place = place;
        this.form.patchValue(this.place);
      });
    });
  }

  onUpdateOffer() {
    if (!this.form.valid) {
      return;
    }
    this.loadingController.create({
      message: 'Editing place...',
    }).then(loadingEl => {
      loadingEl.present();
      this.placesService.editPlace(
        this.place.id,
        this.form.get('title').value,
        this.form.get('description').value
      ).subscribe(place => {
        loadingEl.dismiss();
        this.form.reset();
        this.router.navigateByUrl('/places/tabs/offers');
      });
    });
  }

  ngOnDestroy(): void {
    if (this.placeSub) {
      this.placeSub.unsubscribe();
    }
  }
}
