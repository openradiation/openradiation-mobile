import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '@app/services/navigation.service';
import { DisablePlaneMode, EnablePLaneMode } from '@app/states/measures/measures.action';
import { MeasuresState } from '@app/states/measures/measures.state';

@Component({
  selector: 'app-plane-mode',
  templateUrl: './plane-mode.page.html',
  styleUrls: ['./plane-mode.page.scss']
})
export class PlaneModePage {
  planeMode$: Observable<boolean> = inject(Store).select(MeasuresState.planeMode);

  constructor(private navigationService: NavigationService, private store: Store) { }

  goBack() {
    this.navigationService.goBack();
  }

  onParamSelectedChange(value: CustomEvent) {
    if (value.detail && value.detail.value === true) {
      this.store.dispatch(new EnablePLaneMode());
    } else {
      this.store.dispatch(new DisablePlaneMode());
    }
  }
}
