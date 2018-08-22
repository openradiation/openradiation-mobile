import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number): string {
    return `${Math.floor(value / (1000 * 60))
      .toString()
      .padStart(2, '0')}:${Math.round((value % (1000 * 60)) / 1000)
      .toString()
      .padStart(2, '0')}`;
  }
}
