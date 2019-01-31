import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TabsGuard implements CanActivateChild {
  private canActivateRoute = true;

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const canActivate = this.canActivateRoute;
    this.canActivateRoute = true;
    return canActivate && state.url !== '/tabs/other';
  }

  blockNavigation() {
    this.canActivateRoute = false;
  }
}
