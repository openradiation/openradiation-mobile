import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    const hourConstant = 1000 * 60 * 60;
    const minuteConstant = 1000 * 60;
    const hours = Math.floor(value / hourConstant);
    const minutes = Math.floor((value % hourConstant) / minuteConstant);
    const seconds = Math.floor((value % minuteConstant) / 1000);
    if (hours >= 1) {
      return `${this.formatNumber(hours)}:${this.formatNumber(minutes)}'`;
    } else {
      return `${this.formatNumber(minutes)}'${this.formatNumber(seconds)}"`;
    }
  }

  formatNumber(value: number): string {
    return value.toString().padStart(2, '0');
  }
}
