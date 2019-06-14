import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-double-button',
  templateUrl: './double-button.component.html',
  styleUrls: ['./double-button.component.scss']
})
export class DoubleButtonComponent {
  @Input()
  headerMessage: string;
  @Input()
  mainMessage: string;
  @Input()
  modeSimple: boolean;
  @Output()
  click = new EventEmitter();

  onClick(event: MouseEvent) {
    event.stopPropagation();
    this.click.emit();
  }
}
