import { Component, Input } from '@angular/core';

@Component({
  selector: 'source-info',
  templateUrl: './source-info.component.html',
  styleUrls: ['./source-info.component.css']
})
export class SourceInfoComponent {
  @Input() info: any;
}
