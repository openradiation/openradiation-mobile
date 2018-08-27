import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { BLE } from '@ionic-native/ble/ngx';
import { Device } from '@ionic-native/device/ngx';
import { Diagnostic } from '@ionic-native/diagnostic/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Network } from '@ionic-native/network/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsFormPluginModule } from '@ngxs/form-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MenuComponent } from './pages/menu/menu.component';
import { DevicesState } from './states/devices/devices.state';
import { MeasuresState } from './states/measures/measures.state';
import { UserState } from './states/user/user.state';
import { ScreenOrientation } from '@ionic-native/screen-orientation/ngx';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [AppComponent, MenuComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    NgxsModule.forRoot([DevicesState, MeasuresState, UserState]),
    NgxsFormPluginModule.forRoot(),
    NgxsStoragePluginModule.forRoot({
      key: ['devices.knownDevices', 'measures.measures', 'measures.params', 'user']
    }),
    NgxsLoggerPluginModule.forRoot(),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    HttpClientModule
  ],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    BLE,
    Geolocation,
    Diagnostic,
    Network,
    Device,
    ScreenOrientation,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
