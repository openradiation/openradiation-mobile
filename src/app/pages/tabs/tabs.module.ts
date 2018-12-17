import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TabsRoutingModule } from './tabs-routing.module';
import { Tabs } from './tabs.component';

@NgModule({
  imports: [IonicModule, CommonModule, FormsModule, TabsRoutingModule],
  declarations: [Tabs]
})
export class TabsModule {}
