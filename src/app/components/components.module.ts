import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js';
import { AccordionComponent } from './accordion/accordion.component';
import { CategoryLabelComponent } from './category-label/category-label.component';
import { DoubleButtonComponent } from './double-button/double-button.component';
import { GpsIndicatorComponent } from './gps-indicator/gps-indicator.component';
import { HeaderComponent } from './header/header.component';
import { PhotoComponent } from './photo/photo.component';
import { DosePipe } from './pipes/dose/dose.pipe';
import { DurationPipe } from './pipes/duration/duration.pipe';
import { HitNumberPerMinPipe } from './pipes/hit-number-per-min/hit-number-per-min.pipe';
import { HitNumberPipe } from './pipes/hit-number/hit-number.pipe';
import { SanitizeHtmlPipe } from './pipes/sanitize-html/sanitize-html.pipe';
import { RoundButtonComponent } from './round-button/round-button.component';
import { SelectIconComponent } from './select-icon/select-icon.component';
import { SeriesGraphComponent } from './series-graph/series-graph.component';
import { TagListComponent } from './tag-list/tag-list.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
    imports: [CommonModule, FormsModule, IonicModule, TranslateModule, PlotlyModule],
    declarations: [
        HeaderComponent,
        CategoryLabelComponent,
        AccordionComponent,
        RoundButtonComponent,
        GpsIndicatorComponent,
        DurationPipe,
        HitNumberPerMinPipe,
        HitNumberPipe,
        DosePipe,
        SelectIconComponent,
        TagListComponent,
        PhotoComponent,
        SanitizeHtmlPipe,
        SeriesGraphComponent,
        DoubleButtonComponent
    ],
    exports: [
        HeaderComponent,
        CategoryLabelComponent,
        AccordionComponent,
        RoundButtonComponent,
        GpsIndicatorComponent,
        DurationPipe,
        HitNumberPerMinPipe,
        HitNumberPipe,
        DosePipe,
        SelectIconComponent,
        TagListComponent,
        PhotoComponent,
        SanitizeHtmlPipe,
        SeriesGraphComponent,
        DoubleButtonComponent
    ]
})
export class ComponentsModule {}
