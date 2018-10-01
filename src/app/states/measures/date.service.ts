import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateService {
  constructor(private datePipe: DatePipe) {}

  toISOString(date: Date | string | number): string {
    return this.datePipe.transform(date instanceof Date ? date : new Date(date), 'yyyy-MM-ddTHH:mm:ssZZZZZ')!;
  }

  toISODuration(duration: number): string {
    const hourConstant = 1000 * 60 * 60;
    const minuteConstant = 1000 * 60;
    const hours = Math.floor(duration / hourConstant);
    const minutes = Math.floor((duration % hourConstant) / minuteConstant);
    const seconds = Math.round((duration % minuteConstant) / 1000);
    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(seconds);
    return this.toISOString(date);
  }
}
