import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AccordionComponent } from './accordion/accordion.component';
import { CategoryLabelComponent } from './category-label/category-label.component';
import { HeaderComponent } from './header/header.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule.forRoot()],
  declarations: [HeaderComponent, CategoryLabelComponent, AccordionComponent],
  exports: [HeaderComponent, CategoryLabelComponent, AccordionComponent],
  entryComponents: []
})
export class ComponentsModule {}
