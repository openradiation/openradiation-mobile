import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
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
  displayTagList: string[] = [];
  displayedProposedTagList?: string[];
  currentTag = '';
  isDisabled: boolean;

  @Input()
  title?: string;

  @Input()
  hiddenTag?: string;

  @Input()
  proposedTagList?: string[];

  @Input()
  proposedTagListTitle?: string;

  @Output()
  tagAdded = new EventEmitter<string>();

  private onChange = (_option: string[] | undefined) => {
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

  writeValue(tagList: string[] | undefined): void {
    this.tagList = tagList;
    this.displayTagList = this.tagList ? this.tagList.filter(tag => tag !== this.hiddenTag) : [];
    this.updateDisplayedProposedTagList();
    this.onChange(this.tagList);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  deleteTag(index: number): void {
    if (this.tagList && !this.isDisabled) {
      this.tagList.splice(index, 1);
      this.writeValue(this.tagList);
    }
  }

  addCurrentTag(): void {
    if (this.currentTag) {
      this.addTag(this.currentTag);
      this.updateDisplayedProposedTagList();
    }
  }

  addTag(tag: string): void {
    this.currentTag = '';
    if (!this.tagList) {
      this.tagList = [];
    }
    this.tagList = [...this.tagList, tag];
    this.writeValue(this.tagList);
    this.tagAdded.emit(tag);
  }

  updateDisplayedProposedTagList() {
    this.displayedProposedTagList =
      this.proposedTagList && this.currentTag
        ? this.proposedTagList
          .filter(
            proposedTag =>
              (!this.tagList || this.tagList.every(tag => tag !== proposedTag)) &&
              proposedTag.startsWith(this.currentTag)
          )
          .slice(0, 6)
        : undefined;
  }
}
