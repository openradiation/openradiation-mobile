import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

import { SplashScreen } from '@capacitor/splash-screen';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let statusBarSpy: jasmine.SpyObj<StatusBarMock>;
  let splashScreenSpy: jasmine.SpyObj<SplashScreenMock>;
  let platformReadySpy: unknown;
  let platformSpy: jasmine.SpyObj<PlatformMock>;

  beforeEach(async () => {
    statusBarSpy = jasmine.createSpyObj('StatusBar', ['setOverlaysWebView']);
    splashScreenSpy = jasmine.createSpyObj('SplashScreen', ['hide']);
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: StatusBar, useValue: statusBarSpy },
        { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: Platform, useValue: platformSpy }
      ],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    TestBed.createComponent(AppComponent);
    expect(platformSpy.ready).toHaveBeenCalled();
    await platformReadySpy;
    expect(statusBarSpy.setOverlaysWebView).toHaveBeenCalled();
    expect(splashScreenSpy.hide).toHaveBeenCalled();
  });
});

interface StatusBarMock {
  setOverlaysWebView(): void;
}

interface SplashScreenMock {
  hide(): void;
}

interface PlatformMock {
  ready(): void;
}