import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '../../../components/components.module';
import { MeasureScanPage } from './measure-scan.page';

import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

const routes: Routes = [
  {
    path: '',
    component: MeasureScanPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    TranslateModule,
    PlotlyModule
  ],
  declarations: [MeasureScanPage]
})
export class MeasureScanPageModule {}
