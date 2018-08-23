import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TabsService {
  currentTab: ReplaySubject<Element> = new ReplaySubject<Element>(1);
}
