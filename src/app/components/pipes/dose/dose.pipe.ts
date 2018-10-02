import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dose'
})
export class DosePipe implements PipeTransform {
  transform(value: number): string {
    if (value > 99999.9) {
      return value.toFixed(0);
    } else if (value > 9991.99) {
      return value.toFixed(1);
    } else if (value > 999.999) {
      return value.toFixed(2);
    }
    return value.toFixed(3);
  }
}
