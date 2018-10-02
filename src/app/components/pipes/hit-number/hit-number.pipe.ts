import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hitNumber'
})
export class HitNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 99999) {
      return value.toExponential(2).replace('e+', 'E');
    }
    return value.toFixed(0);
  }
}
