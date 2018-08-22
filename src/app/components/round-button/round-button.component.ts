import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-round-button',
  templateUrl: './round-button.component.html',
  styleUrls: ['./round-button.component.scss']
})
export class RoundButtonComponent {
  @Input()
  src: string;

  @Input()
  disabled: boolean;

  @Output()
  click = new EventEmitter();
}
