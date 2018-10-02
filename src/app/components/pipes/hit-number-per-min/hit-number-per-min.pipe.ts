import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hitNumberPerMin'
})
export class HitNumberPerMinPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 99999) {
      return value.toExponential(2).replace('e+', 'E');
    } else if (value > 999.99) {
      return value.toFixed(0);
    }
    return value.toFixed(2);
  }
}
