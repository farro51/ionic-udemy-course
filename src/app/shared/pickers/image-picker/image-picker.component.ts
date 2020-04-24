import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { Event } from '@angular/router';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @Output() imagePick = new EventEmitter<string>();
  @ViewChild('filePicker', { static: false }) filePicker: ElementRef<HTMLInputElement>;
  selectedImage: string;
  usePicker = false;

  constructor(private platform: Platform) { }

  ngOnInit() {
    if ((this.platform.is('mobile') && !this.platform.is('hybrid')) ||
        this.platform.is('desktop')) {
      this.usePicker = true;
    }
  }

  onPickImage() {
    if (!Capacitor.isPluginAvailable('Camera') || this.usePicker) {
      this.filePicker.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50, // Va de 1 a 100 define la definición de la foto
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.DataUrl // CameraResultType.Base64
    }).then(image => {
      this.selectedImage = image.dataUrl;// image.base64String;
      console.log(image.dataUrl);
      this.imagePick.emit(image.dataUrl);
    }).catch(error => {
      console.log(error);
      return false;
    });
  }

  onFileChosen(event: Event) {

  }
}
