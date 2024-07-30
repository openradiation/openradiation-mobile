import { NgxsModule } from '@ngxs/store';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

export function getTestImports() {
    return [
        // Provides "Plugin Manager"
        NgxsModule.forRoot([]),
        // Provides TranslateService
        TranslateModule.forRoot({}),
        // Provides ActivatedRoute
        RouterModule.forRoot([]),

    ]
}

export function getTestProviders() {
    return [
        // Provides HttpClient
        provideHttpClient()
    ]
}