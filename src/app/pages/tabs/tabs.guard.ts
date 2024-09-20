import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TabsGuard {
  private canActivateRoute = true;

  canActivateChild(_route: ActivatedRouteSnapshot, _state: RouterStateSnapshot): boolean {
    const canActivate = this.canActivateRoute;
    this.canActivateRoute = true;
    return canActivate;
  }

  blockNavigation() {
    this.canActivateRoute = false;
  }
}
