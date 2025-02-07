import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StatusBar } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

import { SplashScreen } from '@capacitor/splash-screen';
import { AppComponent } from './app.component';
import { getTestImports, getTestProviders } from '@tests/TestUtils';

describe('AppComponent', () => {
  let platformReadySpy: jasmine.Spy<any>;
  let mockPlatform: MockPlatform;

  beforeEach(async () => {
    platformReadySpy = jasmine.createSpy().and.returnValue(Promise.resolve());

    const mockBackButton = new MockBackButton();
    mockBackButton.subscribeWithPriority = jasmine.createSpy('subscribeWithPriority', (_priority: unknown, _fn: unknown) => {
      // Spy
    });
    mockPlatform = new MockPlatform();
    mockPlatform.ready = platformReadySpy;
    mockPlatform.backButton = mockBackButton;

    TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: getTestImports(),
      providers: [
        ...getTestProviders(),
        { provide: Platform, useValue: mockPlatform }
      ],
    }).compileComponents();
  });

  it('should create the app', async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize the app', async () => {
    spyOn(StatusBar, 'setOverlaysWebView');
    spyOn(StatusBar, 'setStyle');
    spyOn(SplashScreen, 'hide');

    // Wait for app to be launched
    await TestBed.createComponent(AppComponent).isStable()
    await platformReadySpy;
    await sleep(1000);

    // Make sure expected capacitor plugin have been called
    expect(StatusBar.setOverlaysWebView).toHaveBeenCalledTimes(1);
    expect(StatusBar.setStyle).toHaveBeenCalledTimes(1);
    expect(SplashScreen.hide).toHaveBeenCalledTimes(1);
  });
});
class MockPlatform {
  ready: jasmine.Spy<any>;
  backButton: unknown;
}

class MockBackButton {
  subscribeWithPriority: jasmine.Spy<any>;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}