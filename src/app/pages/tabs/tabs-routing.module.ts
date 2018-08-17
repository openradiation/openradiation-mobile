import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AboutPage } from './about/about.page';
import { HistoryPage } from './history/history.page';
import { HomePage } from './home/home.page';
import { LegalNoticePage } from './legal-notice/legal-notice.page';
import { ManualMeasurePage } from '../measure/manual-measure/manual-measure.page';
import { MapPage } from './map/map.page';
import { DeviceParamPage } from './settings/device-param/device-param.page';
import { DevicesPage } from './settings/devices/devices.page';
import { LogInPage } from './settings/log-in/log-in.page';
import { MeasuresParamPage } from './settings/measures-param/measures-param.page';
import { SettingsPage } from './settings/settings/settings.page';
import { TabsGuard } from './tabs.guard';
import { Tabs } from './tabs.component';

const routes: Routes = [
  {
    path: 'tabs',
    component: Tabs,
    canActivateChild: [TabsGuard],
    children: [
      {
        path: 'home',
        outlet: 'home',
        component: HomePage
      },
      {
        path: 'history',
        outlet: 'history',
        component: HistoryPage
      },
      {
        path: 'settings',
        outlet: 'settings',
        component: SettingsPage
      },
      {
        path: 'devices',
        outlet: 'settings',
        component: DevicesPage
      },
      {
        path: 'device-param',
        outlet: 'settings',
        component: DeviceParamPage
      },
      {
        path: 'measures-param',
        outlet: 'settings',
        component: MeasuresParamPage
      },
      {
        path: 'log-in',
        outlet: 'settings',
        component: LogInPage
      },
      {
        path: 'map',
        outlet: 'map',
        component: MapPage
      },
      {
        path: 'legal-notice',
        outlet: 'other',
        component: LegalNoticePage
      },
      {
        path: 'about',
        outlet: 'other',
        component: AboutPage
      },
      {
        path: 'manual-measure',
        outlet: 'other',
        component: ManualMeasurePage
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/(home:home)',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {}
