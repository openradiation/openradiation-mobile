import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { ManualMeasurePageModule } from './manual-measure/manual-measure.module';
import { ScanMeasurePageModule } from './scan-measure/scan-measure.module';
import { MeasureRoutingModule } from './measure-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    MeasureRoutingModule,
    ManualMeasurePageModule,
    ScanMeasurePageModule
  ],
  declarations: []
})
export class MeasureModule {}
