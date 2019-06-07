import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  keyboardOpen: boolean;

  constructor() {
    this.initializeApp();
  }

  initializeApp() {
    window.addEventListener('keyboardWillShow', () => (this.keyboardOpen = true));
    window.addEventListener('keyboardWillHide', () => (this.keyboardOpen = false));
  }
}

export interface Form<T> {
  model: T;
  dirty: boolean;
  status: string;
  errors: any;
}
