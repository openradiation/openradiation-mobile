import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';

@Component({
  selector: 'app-photo',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
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

  writeValue(tagList: any): void {
    this.photo = tagList;
    this.onChange(this.photo);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  addPhoto(photo: string): void {}

  deletePhoto(): void {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
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
