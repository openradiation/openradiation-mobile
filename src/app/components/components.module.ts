import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionComponent } from './accordion/accordion.component';
import { CategoryLabelComponent } from './category-label/category-label.component';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { HitNumberPipe } from './pipes/hit-number/hit-number.pipe';
import { GpsIndicatorComponent } from './gps-indicator/gps-indicator.component';
import { HeaderComponent } from './header/header.component';
import { RoundButtonComponent } from './round-button/round-button.component';
import { SelectIconComponent } from './select-icon/select-icon.component';
import { TagListComponent } from './tag-list/tag-list.component';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule.forRoot(), TranslateModule],
  declarations: [
    HeaderComponent,
    CategoryLabelComponent,
    AccordionComponent,
    RoundButtonComponent,
    GpsIndicatorComponent,
    DurationPipe,
    HitNumberPipe,
    SelectIconComponent,
    TagListComponent
  ],
  exports: [
    HeaderComponent,
    CategoryLabelComponent,
    AccordionComponent,
    RoundButtonComponent,
    GpsIndicatorComponent,
    DurationPipe,
    HitNumberPipe,
    SelectIconComponent,
    TagListComponent
  ],
  entryComponents: []
})
export class ComponentsModule {}
