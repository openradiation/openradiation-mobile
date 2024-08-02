import { NgxsModule } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { DevicesState } from '../app/states/devices/devices.state';
import { MeasuresState } from '../app/states/measures/measures.state';
import { UserState } from '../app/states/user/user.state';
import { DatePipe } from '@angular/common';

export function getTestImports() {

    return [
        // Provides "Plugin Manager"
        NgxsModule.forRoot([
            DevicesState,
            MeasuresState,
            UserState
        ]),
        // Provides TranslateService
        TranslateModule.forRoot({}),
        // Provides ActivatedRoute
        RouterModule.forRoot([]),
        // Provides all ionic elements (ion-list, ion-button...)
        IonicModule.forRoot(),
    ]
}

export function getTestProviders() {
    return [
        // Provides HttpClient
        provideHttpClient(),
        // Provides DatePipe
        DatePipe,
    ]
}