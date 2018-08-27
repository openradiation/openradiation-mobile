import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  constructor(private datePipe: DatePipe) {}

  toISOString(date: Date | string | number): string {
    return this.datePipe.transform(date instanceof Date ? date : new Date(date), 'yyyy-MM-ddTHH:mm:ssZZZZZ')!;
  }

  toISODuration(duration: number): string {
    const minutes = Math.floor(duration / (1000 * 60));
    const seconds = Math.round((duration % (1000 * 60)) / 1000);
    const date = new Date();
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return this.toISOString(date);
  }
}
