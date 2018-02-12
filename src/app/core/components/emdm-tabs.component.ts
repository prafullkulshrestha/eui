import { Component, EventEmitter, Output } from '@angular/core';

import { EmdmTabComponent } from './emdm-tab.component';

@Component({
    selector: 'emdm-tabs',
    template: `
        <div class="row">
            <div *ngFor="let tab of tabs" (click)="selectTab(tab)" class="tab-header big-label"
                    [class.active]="tab.active" [style.width]="100/tabs.length+'%'" 
                    style="display: inline-block;">
                {{tab.title}}
            </div>
        </div>
        <div class="row">
            <ng-content></ng-content>
        </div>
    `,
    styleUrls: ['./emdm-tabs.component.css']
})
export class EmdmTabsComponent {
    tabs: EmdmTabComponent[] = [];

    @Output() onTabSelectionChanged: EventEmitter<any> = new EventEmitter();

    addTab(tab: EmdmTabComponent) {
        if(this.tabs.length === 0) {
            tab.active = true;
            this.onTabSelectionChanged.emit(tab.name);
        }
        this.tabs.push(tab);
    }

    selectTab(tab: EmdmTabComponent) {
        this.tabs.forEach((tab) => { tab.active = false; });
        tab.active = true;
        this.onTabSelectionChanged.emit(tab.name);
    }
}