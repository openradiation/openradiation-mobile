import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { ComponentsModule } from '../../../components/components.module';
import { DeviceParamPage } from './device-param.page';

const routes: Routes = [
  {
    path: '',
    component: DeviceParamPage
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
    ComponentsModule
  ],
  declarations: [DeviceParamPage]
})
export class DeviceParamPageModule {}
