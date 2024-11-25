import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { ComponentsModule } from '@app/components/components.module';
import { MeasureSeriesReportPage } from './measure-series-report-page';
import { MaskitoDirective } from '@maskito/angular';

const routes: Routes = [
  {
    path: '',
    component: MeasureSeriesReportPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaskitoDirective,
    RouterModule.forChild(routes),
    NgxsFormPluginModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule,
    // FixMe Capacitor migration
    // NgxMaskIonicModule.forRoot()
  ],
  declarations: [MeasureSeriesReportPage],
})
export class MeasureReportSeriesPageModule {}
