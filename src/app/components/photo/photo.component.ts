import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Camera, CameraOptions, PictureSourceType } from '@ionic-native/camera/ngx';

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

  // Function to call when the rating changes.
  private onChange = (option: any) => {};

  // Function to call when the input is touched (when a star is clicked).
  private onTouched = () => {};

  constructor(private camera: Camera) {}

  registerOnChange(fn: (option: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(photo: string): void {
    this.photo = photo;
    this.onChange(this.photo);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  deletePhoto(): void {
    this.photo = '';
  }

  addPhoto(source: PictureSourceType): void {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: source,
      targetWidth: 600,
      targetHeight: 800
    };

    this.camera.getPicture(options).then(
      imageData => {
        this.photo = 'data:image/jpeg;base64,' + imageData;
      },
      err => {
        console.log('error photo ' + err);
      }
    );
  }
}
