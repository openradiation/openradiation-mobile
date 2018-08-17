import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ManualMeasurePage } from './manual-measure/manual-measure.page';
import { ScanMeasurePage } from './scan-measure/scan-measure.page';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'scan',
        component: ScanMeasurePage
      },
      {
        path: 'manual',
        component: ManualMeasurePage
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeasureRoutingModule {}
