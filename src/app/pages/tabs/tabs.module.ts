import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TabsRoutingModule } from './tabs-routing.module';

import { AboutPageModule } from './about/about.module';
import { HistoryPageModule } from './history/history.module';
import { HomePageModule } from './home/home.module';
import { LegalNoticePageModule } from './legal-notice/legal-notice.module';
import { ManualMeasurePageModule } from '../measure/manual-measure/manual-measure.module';
import { MapPageModule } from './map/map.module';
import { DeviceParamPageModule } from './settings/device-param/device-param.module';
import { DevicesPageModule } from './settings/devices/devices.module';
import { LogInPageModule } from './settings/log-in/log-in.module';
import { MeasuresParamPageModule } from './settings/measures-param/measures-param.module';
import { SettingsPageModule } from './settings/settings/settings.module';
import { Tabs } from './tabs.component';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsRoutingModule,
    // TODO switch to lazyloading in tabs once it's fixed => https://github.com/ionic-team/ionic/issues/14566
    HomePageModule,
    HistoryPageModule,
    MapPageModule,
    SettingsPageModule,
    DevicesPageModule,
    DeviceParamPageModule,
    MeasuresParamPageModule,
    LogInPageModule,
    LegalNoticePageModule,
    AboutPageModule,
    ManualMeasurePageModule
  ],
  declarations: [Tabs]
})
export class TabsModule {}
