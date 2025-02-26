import { Component, inject } from '@angular/core';
import { MeasuresState } from '@app/states/measures/measures.state';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';
import { DisablePlaneMode, EnablePLaneMode } from '@app/states/measures/measures.action';
import { NavigationService } from '@app/services/navigation.service';

@Component({
  selector: 'app-measure-mode',
  templateUrl: './measure-mode.component.html',
  styleUrls: ['./measure-mode.component.scss'],
})
export class MeasureModeComponent {
  planeMode$: Observable<boolean> = inject(Store).select(MeasuresState.planeMode);

  constructor(
    private store: Store,
    private navigationService: NavigationService,
  ) {}

  switchMeasureMode(planeMode: boolean) {
    if (planeMode) {
      this.store.dispatch(new EnablePLaneMode());
    } else {
      this.store.dispatch(new DisablePlaneMode());
    }
  }

  goToPlaneMode() {
    this.navigationService.navigateForward(['tabs', 'settings', 'plane-mode'], { animated: true });
  }
}
