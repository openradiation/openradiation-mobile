import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TabsPageRoutingModule } from './tabs.router.module';

import { HistoryPageModule } from '../history/history.module';
import { HomePageModule } from '../home/home.module';
import { MapPageModule } from '../map/map.module';
import { SettingsPageModule } from '../settings/settings/settings.module';
import { TabsPage } from './tabs.page';
import { DevicesPageModule } from '../settings/devices/devices.module';
import { DeviceParamPageModule } from '../settings/device-param/device-param.module';
import { LegalNoticePageModule } from '../legal-notice/legal-notice.module';
import { AboutPageModule } from '../about/about.module';
import { ManualMeasurePageModule } from '../manual-measure/manual-measure.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TabsPageRoutingModule,
    // TODO switch to lazyloading in tabs once it's fixed => https://github.com/ionic-team/ionic/issues/14566
    HomePageModule,
    HistoryPageModule,
    MapPageModule,
    SettingsPageModule,
    DevicesPageModule,
    DeviceParamPageModule,
    LegalNoticePageModule,
    AboutPageModule,
    ManualMeasurePageModule
  ],
  declarations: [TabsPage]
})
export class TabsPageModule {}
