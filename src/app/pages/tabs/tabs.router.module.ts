import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HistoryPage } from '../history/history.page';
import { HomePage } from '../home/home.page';
import { MapPage } from '../map/map.page';
import { SettingsPage } from '../settings/settings.page';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      // TODO switch to lazyloading in tabs once it's fixed => https://github.com/ionic-team/ionic/issues/14566
      // {
      //   path: 'home',
      //   outlet: 'home',
      //   loadChildren: '../home/home.module#HomePageModule'
      // },
      // {
      //   path: 'history',
      //   outlet: 'history',
      //   loadChildren: '../history/history.module#HistoryPageModule'
      // },
      // {
      //   path: 'settings',
      //   outlet: 'settings',
      //   loadChildren: '../settings/settings.module#SettingsPageModule'
      // },
      // {
      //   path: 'map',
      //   outlet: 'map',
      //   loadChildren: '../map/map.module#MapPageModule'
      // }
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
