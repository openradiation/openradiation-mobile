import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { ComponentsModule } from '@app/components/components.module';
import { MeasureReportPage } from './measure-report-page';
import { MaskitoDirective } from '@maskito/angular';

const routes: Routes = [
  {
    path: '',
    component: MeasureReportPage,
  },
];

@NgModule({
  imports: [
    MaskitoDirective,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    NgxsFormPluginModule,
    ReactiveFormsModule,
    ComponentsModule,
    TranslateModule,
    // Fixme Capacitor migration
    // NgxMaskIonicModule.forRoot()
  ],
  declarations: [MeasureReportPage],
})
export class MeasureReportPageModule {}
