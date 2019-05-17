import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Tabs } from './tabs.component';
import { TabsGuard } from './tabs.guard';

const routes: Routes = [
  {
    path: 'tabs',
    component: Tabs,
    children: [
      {
        path: 'home',
        children: [
          {
            path: '',
            loadChildren: './home/home.module#HomePageModule'
          }
        ]
      },
      {
        path: 'history',
        children: [
          {
            path: '',
            loadChildren: './history/history.module#HistoryPageModule'
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: './settings/settings/settings.module#SettingsPageModule'
          },
          {
            path: 'devices',
            loadChildren: './settings/devices/devices.module#DevicesPageModule'
          },
          {
            path: 'device-param',
            loadChildren: './settings/device-param/device-param.module#DeviceParamPageModule'
          },
          {
            path: 'measures-param',
            loadChildren: './settings/measures-param/measures-param.module#MeasuresParamPageModule'
          },
          {
            path: 'plane-mode',
            loadChildren: './settings/plane-mode/plane-mode.module#PlaneModePageModule'
          },
          {
            path: 'log-in',
            loadChildren: './settings/log-in/log-in.module#LogInPageModule'
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: './map/map.module#MapPageModule'
          }
        ]
      },
      {
        path: 'other',
        canActivateChild: [TabsGuard],
        children: [
          {
            path: ''
          },
          {
            path: 'legal-notice',
            loadChildren: './legal-notice/legal-notice.module#LegalNoticePageModule'
          },
          {
            path: 'about',
            loadChildren: './about/about.module#AboutPageModule'
          }
        ]
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TabsRoutingModule {}
