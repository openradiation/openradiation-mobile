import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrls: ['./tag-list.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagListComponent),
      multi: true
    }
  ]
})
export class TagListComponent implements ControlValueAccessor {
  tagList: string[] | undefined;
  currentTag = '';
  isDisabled: boolean;

  @Input()
  title?: string;

  // Function to call when the rating changes.
  private onChange = (option: any) => {};

  // Function to call when the input is touched (when a star is clicked).
  private onTouched = () => {};

  registerOnChange(fn: (option: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  writeValue(tagList: any): void {
    this.tagList = tagList;
    this.onChange(this.tagList);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  deleteTag(index: number): void {
    if (this.tagList) {
      this.tagList.splice(index, 1);
      this.writeValue(this.tagList);
    }
  }

  addTag(): void {
    if (this.currentTag) {
      if (!this.tagList) {
        this.tagList = [];
      }
      this.tagList.push(this.currentTag);
      this.currentTag = '';
      this.writeValue(this.tagList);
    }
  }
}
