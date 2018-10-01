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
    const seconds = Math.round((value % minuteConstant) / 1000);
    if (hours >= 1) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}'`;
    } else {
      return `${minutes.toString().padStart(2, '0')}'${seconds.toString().padStart(2, '0')}''`;
    }
  }
}
