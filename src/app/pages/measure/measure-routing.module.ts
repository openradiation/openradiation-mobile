import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeasureReportPage } from './measure-report/measure-report-page';
import { MeasureScanPage } from './measure-scan/measure-scan.page';
import { MeasureStepsPage } from './measure-steps/measure-steps.page';

const routes: Routes = [
  {
    path: 'scan',
    component: MeasureScanPage
  },
  {
    path: 'report',
    component: MeasureReportPage
  },
  {
    path: 'steps',
    component: MeasureStepsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeasureRoutingModule {}
