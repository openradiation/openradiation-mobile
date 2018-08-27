import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MeasureReportPage } from './measure-report/measure-report-page';
import { MeasureScanPage } from './measure-scan/measure-scan.page';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'scan',
        component: MeasureScanPage
      },
      {
        path: 'report',
        children: [
          {
            path: 'scan',
            component: MeasureReportPage
          },
          {
            path: 'manual',
            component: MeasureReportPage
          }
        ]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MeasureRoutingModule {}
