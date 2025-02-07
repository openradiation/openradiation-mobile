import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Camera, ImageOptions, CameraResultType, CameraSource } from '@capacitor/camera';

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

  private onChange = (_option: string | undefined) => {
    // Left empty
  };

  private onTouched = () => {
    // Left empty
  };

  registerOnChange(fn: (option: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(photo: string | undefined): void {
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
    // All available options can be found here https://capacitorjs.com/docs/apis/camera#imageoptions
    const options: ImageOptions = {
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
      width: 600,
      height: 800,
      correctOrientation: true
    };
    this.addPhoto(options);
  }

  openGallery(): void {
    const options: ImageOptions = {
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
      width: 600,
      height: 800,
      correctOrientation: true
    };
    this.addPhoto(options);
  }

  async addPhoto(options: ImageOptions): Promise<void> {
    try {
      const imageData = await Camera.getPhoto(options);
      this.writeValue(imageData.dataUrl);
    } catch (error) {
      console.error("Error while taking pictures", error, options);
    }
  }
}
