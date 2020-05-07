import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef, Input } from '@angular/core';
import { Capacitor, Plugins, CameraSource, CameraResultType } from '@capacitor/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-image-picker',
  templateUrl: './image-picker.component.html',
  styleUrls: ['./image-picker.component.scss'],
})
export class ImagePickerComponent implements OnInit {
  @Input() showPreview = false;
  @Output() imagePick = new EventEmitter<string | File>();
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
    if (!Capacitor.isPluginAvailable('Camera')) {
      this.filePicker.nativeElement.click();
      return;
    }
    Plugins.Camera.getPhoto({
      quality: 50, // Va de 1 a 100 define la definición de la foto
      source: CameraSource.Prompt,
      correctOrientation: true,
      width: 600,
      resultType: CameraResultType.Base64 // CameraResultType.DataUrl
    }).then(image => {
      this.selectedImage = image.base64String;// image.dataUrl;
      this.imagePick.emit(image.dataUrl);
    }).catch(error => {
      console.log(error);
      if (this.usePicker) {
        this.filePicker.nativeElement.click();
      }
      return false;
    });
  }

  onFileChosen(event: Event) {
    const pickedFile = (event.target as HTMLInputElement).files[0];
    if (!pickedFile) {
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
      const dataUrl = fr.result.toString();
      this.selectedImage = dataUrl;
      this.imagePick.emit(pickedFile);
    }
    fr.readAsDataURL(pickedFile);
  }
}
