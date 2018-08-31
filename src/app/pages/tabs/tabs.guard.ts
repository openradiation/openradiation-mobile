import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  GuardsCheckStart,
  Router,
  RouterStateSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, take } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TabsGuard implements CanActivateChild {
  private firstRoutingEvent = true;
  private event: Observable<boolean>;

  constructor(private router: Router) {
    this.event = this.router.events.pipe(
      filter((event): event is GuardsCheckStart => event instanceof GuardsCheckStart),
      map(event => event.url !== '/#'),
      shareReplay(1)
    );
    this.event.subscribe();
  }
  canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    if (this.firstRoutingEvent) {
      this.firstRoutingEvent = false;
      return true;
    } else {
      return this.event.pipe(take(1));
    }
  }
}
