import { Component, Input } from '@angular/core';

@Component({
  selector: 'org-source-info',
  templateUrl: './org-source-info.component.html',
  styleUrls: ['./org-source-info.component.css']
})
export class OrgSourceInfoComponent {

  @Input() info: any;
}
