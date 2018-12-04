import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-photo',
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PhotoComponent),
      multi: true
    }
  ]
})
export class PhotoComponent implements ControlValueAccessor {
  photo: string | undefined;
  isDisabled: boolean;

  @Input()
  title?: string;

  private onChange = (option: any) => {};

  private onTouched = () => {};

  constructor(private camera: Camera) {}

  registerOnChange(fn: (option: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(photo: any): void {
    this.photo = photo;
    this.onChange(this.photo);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  deletePhoto(): void {
    this.writeValue(undefined);
  }

  openCamera(): void {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.CAMERA,
      targetWidth: 600,
      targetHeight: 800,
      correctOrientation: true
    };
    this.addPhoto(options);
  }

  openGallery(): void {
    const options: CameraOptions = {
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      targetWidth: 600,
      targetHeight: 800
    };
    this.addPhoto(options);
  }

  addPhoto(options: CameraOptions): void {
    this.camera.getPicture(options).then(imageData => {
      this.writeValue('data:image/jpeg;base64,' + imageData);
    });
  }
}
