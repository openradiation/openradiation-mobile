import { Component } from '@angular/core';
import { MenuController } from '@ionic/angular';
import { NavigationEnd, Router } from '@angular/router';
import { Actions, ofActionSuccessful, Store } from '@ngxs/store';
import { filter } from 'rxjs/operators';
import { StartManualMeasure } from '../../states/measures/measures.action';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent {
  currentUrl: string;

  constructor(
    private menuController: MenuController,
    private router: Router,
    private store: Store,
    private actions$: Actions
  ) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => (this.currentUrl = event.url));
    this.actions$.pipe(ofActionSuccessful(StartManualMeasure)).subscribe(() => {
      this.closeMenu();
      this.router.navigate(['measure', 'manual']);
    });
  }

  closeMenu() {
    this.menuController.close();
  }

  startManualMeasure() {
    this.store.dispatch(new StartManualMeasure());
  }
}
