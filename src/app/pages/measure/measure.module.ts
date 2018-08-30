import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { MeasureReportPageModule } from './measure-report/measure-report.module';
import { MeasureRoutingModule } from './measure-routing.module';
import { MeasureScanPageModule } from './measure-scan/measure-scan.module';
import { MeasureStepsPageModule } from './measure-steps/measure-steps.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MeasureRoutingModule,
    MeasureReportPageModule,
    MeasureScanPageModule,
    MeasureStepsPageModule
  ],
  declarations: []
})
export class MeasureModule {}
