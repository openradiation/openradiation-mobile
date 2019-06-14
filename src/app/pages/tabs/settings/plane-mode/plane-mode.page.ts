import { Component } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { NavigationService } from '../../../../services/navigation.service';
import { DisablePlaneMode, EnablePLaneMode } from '../../../../states/measures/measures.action';
import { MeasuresState } from '../../../../states/measures/measures.state';

@Component({
  selector: 'app-plane-mode',
  templateUrl: './plane-mode.page.html',
  styleUrls: ['./plane-mode.page.scss']
})
export class PlaneModePage {
  @Select(MeasuresState.planeMode)
  planeMode$: Observable<boolean>;

  constructor(private navigationService: NavigationService, private store: Store) {}

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
