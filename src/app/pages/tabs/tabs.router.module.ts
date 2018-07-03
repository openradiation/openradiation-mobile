import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HistoryPage } from '../history/history.page';
import { HomePage } from '../home/home.page';
import { MapPage } from '../map/map.page';
import { SettingsPage } from '../settings/settings/settings.page';
import { TabsPage } from './tabs.page';
import { DevicesPage } from '../settings/devices/devices.page';
import { DeviceParamPage } from '../settings/device-param/device-param.page';
import { TabsGuard } from './tabs.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
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
        path: 'map',
        outlet: 'map',
        component: MapPage
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
export class TabsPageRoutingModule {}
