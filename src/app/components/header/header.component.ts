import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @Input()
  backButton = false;
  @Input()
  shareButton = false;
   @Input()
  exportButton = false;
  @Input()
  deleteButton = false;
  @Output()
  back = new EventEmitter();
  @Output()
  share = new EventEmitter();
  @Output()
  delete = new EventEmitter();
   @Output()
  export = new EventEmitter();
}
