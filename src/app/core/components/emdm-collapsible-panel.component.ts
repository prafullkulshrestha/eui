import { Component, Input } from '@angular/core';

@Component({
    selector: 'emdm-collapsible-panel',
    templateUrl: './emdm-collapsible-panel.component.html',
    styleUrls: [ "./emdm-collapsible-panel.component.css" ]
})
export class EmdmCollapsiblePanel {
    @Input() info: string = ""; // optional. can specify an info text to be shown right aligned
    @Input() titleTextSize: string; // size of title text
    @Input() hideBorder: boolean = false;
    @Input() collapsed: boolean = true; // if the panel should be collapsed or expanded

    // collapses and expands a panel alternatively
    togglePanelBody() {
        this.collapsed = !this.collapsed;
    }
}