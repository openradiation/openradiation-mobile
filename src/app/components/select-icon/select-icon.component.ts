import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { SelectIconOption } from './select-icon-option';

@Component({
  selector: 'app-select-icon',
  templateUrl: './select-icon.component.html',
  styleUrls: ['./select-icon.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectIconComponent),
      multi: true
    }
  ]
})
export class SelectIconComponent implements ControlValueAccessor {
  selectedOption: SelectIconOption | undefined;
  isDisabled: boolean;

  @Input()
  title?: string;

  @Input()
  options: SelectIconOption[];

  @Input()
  required?: boolean;

  private onChange = (_option: unknown) => {
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

  writeValue(value: unknown): void {
    const selectedOption = this.options.find(option => option.value === value);
    this.selectedOption = this.selectedOption === selectedOption ? undefined : selectedOption;
    this.onChange(this.selectedOption ? this.selectedOption.value : undefined);
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }
}
