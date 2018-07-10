import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CategoryLabelComponent } from './category-label/category-label.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule.forRoot()],
  declarations: [HeaderComponent, CategoryLabelComponent],
  exports: [HeaderComponent, CategoryLabelComponent],
  entryComponents: []
})
export class ComponentsModule {}
