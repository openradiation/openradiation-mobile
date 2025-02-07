import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/components/components.module';
import { HistoryItemComponent } from './history-item/history-item.component';
import { HistoryPage } from './history.page';

import { DataTablesModule } from 'angular-datatables';

const routes: Routes = [
  {
    path: '',
    component: HistoryPage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    TranslateModule,
    DataTablesModule,
  ],
  declarations: [HistoryPage, HistoryItemComponent],
})
export class HistoryPageModule {}
