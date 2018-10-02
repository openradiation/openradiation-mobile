import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hitNumber'
})
export class HitNumberPipe implements PipeTransform {
  transform(value: number): string {
    if (value > 999999) {
      return value.toExponential(2);
    } else if (value > 999.99) {
      return value.toFixed(0);
    }
    return value.toFixed(2);
  }
}
