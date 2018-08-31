import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ComponentsModule } from '../../../components/components.module';
import { HomePage } from './home.page';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: HomePage
      }
    ]),
    ComponentsModule,
    TranslateModule
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
