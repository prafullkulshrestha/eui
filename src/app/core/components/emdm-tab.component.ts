import { Component, Input, OnInit } from '@angular/core';

import { EmdmTabsComponent } from './emdm-tabs.component';

@Component({
    selector: 'emdm-tab',
    template: `
        <div [hidden]="!active" style="padding: 0 20px;">
            <ng-content></ng-content>
        </div>
    `
})
export class EmdmTabComponent implements OnInit {
    @Input() title: string;
    @Input() name: string;

    active: boolean = false;

    constructor(private tabs: EmdmTabsComponent) {}

    ngOnInit() {
        this.tabs.addTab(this);
    }
}