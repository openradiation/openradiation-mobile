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
            loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
          }
        ]
      },
      {
        path: 'history',
        children: [
          {
            path: '',
            loadChildren: () => import('./history/history.module').then(m => m.HistoryPageModule)
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            loadChildren: () => import('./settings/settings/settings.module').then(m => m.SettingsPageModule)
          },
          {
            path: 'devices',
            loadChildren: () => import('./settings/devices/devices.module').then(m => m.DevicesPageModule)
          },
          {
            path: 'device-param',
            loadChildren: () => import('./settings/device-param/device-param.module').then(m => m.DeviceParamPageModule)
          },
          {
            path: 'measures-param',
            loadChildren: () => import('./settings/measures-param/measures-param.module').then(m => m.MeasuresParamPageModule)
          },
          {
            path: 'plane-mode',
            loadChildren: () => import('./settings/plane-mode/plane-mode.module').then(m => m.PlaneModePageModule)
          },
          {
            path: 'log-in',
            loadChildren: () => import('./settings/log-in/log-in.module').then(m => m.LogInPageModule)
          }
        ]
      },
       {
        path: 'feedback',
        children: [
          {
            path: '',
            loadChildren: () => import('./feedback/feedback.module').then(m => m.FeedbackPageModule)
          }
        ]
      },
      {
        path: 'map',
        children: [
          {
            path: '',
            loadChildren: () => import('./map/map.module').then(m => m.MapPageModule)
          }
        ]
      },
      {
        path: 'other',
        canActivateChild: [TabsGuard],
        children: [
          {
            path: '',
            // FIXME should not be empty, but was in previous code version
            redirectTo: '/tabs/other/about',
            pathMatch: 'full'
          },
          {
            path: 'legal-notice',
            loadChildren: () => import('./legal-notice/legal-notice.module').then(m => m.LegalNoticePageModule)
          },
          {
            path: 'about',
            loadChildren: () => import('./about/about.module').then(m => m.AboutPageModule)
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
export class TabsRoutingModule { }
