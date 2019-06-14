import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxMaskIonicModule } from 'ngx-mask-ionic';
import { ComponentsModule } from '../../../../components/components.module';
import { MeasureReportPage } from './measure-report-page';

const routes: Routes = [
  {
    path: '',
    component: MeasureReportPage
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
    TranslateModule,
    NgxMaskIonicModule.forRoot()
  ],
  declarations: [MeasureReportPage]
})
export class MeasureReportPageModule {}
