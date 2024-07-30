import { NgxsModule } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

export function getTestImports() {
    return [
        // Provides "Plugin Manager"
        NgxsModule.forRoot([]),
        // Provides TranslateService
        TranslateModule.forRoot({}),
        // Provides ActivatedRoute
        RouterModule.forRoot([]),
        // Provides all ionic elements (ion-list, ion-button...)
        IonicModule.forRoot()
    ]
}

export function getTestProviders() {
    return [
        // Provides HttpClient
        provideHttpClient()
    ]
}