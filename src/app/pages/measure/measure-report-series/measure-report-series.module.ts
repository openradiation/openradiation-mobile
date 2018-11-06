import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { ComponentsModule } from '../../../components/components.module';
import { MeasureReportSeriesPage } from './measure-report-series-page';

const routes: Routes = [
  {
    path: '',
    component: MeasureReportSeriesPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxsFormPluginModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule
  ],
  declarations: [MeasureReportSeriesPage]
})
export class MeasureReportSeriesPageModule {}
