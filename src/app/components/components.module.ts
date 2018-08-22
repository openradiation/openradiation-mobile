import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AccordionComponent } from './accordion/accordion.component';
import { CategoryLabelComponent } from './category-label/category-label.component';
import { HeaderComponent } from './header/header.component';
import { RoundButtonComponent } from './round-button/round-button.component';
import { GpsIndicatorComponent } from './gps-indicator/gps-indicator.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule.forRoot()],
  declarations: [
    HeaderComponent,
    CategoryLabelComponent,
    AccordionComponent,
    RoundButtonComponent,
    GpsIndicatorComponent
  ],
  exports: [HeaderComponent, CategoryLabelComponent, AccordionComponent, RoundButtonComponent, GpsIndicatorComponent],
  entryComponents: []
})
export class ComponentsModule {}
