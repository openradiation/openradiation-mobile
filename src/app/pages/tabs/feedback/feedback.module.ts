import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TranslateModule } from '@ngx-translate/core';
import { ComponentsModule } from '@app/components/components.module';
import { FeedbackPage } from './feedback.page';

const routes: Routes = [
  {
    path: '',
    component: FeedbackPage
  }
];

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, RouterModule.forChild(routes), ComponentsModule, TranslateModule],
  declarations: [FeedbackPage]
})
export class FeedbackPageModule { }