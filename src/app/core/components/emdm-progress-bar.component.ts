import { Component, OnInit, Input } from '@angular/core';

// progress bar component to show progress of some activity
@Component({
    selector: 'emdm-progress-bar',
    templateUrl: './emdm-progress-bar.component.html',
    styleUrls: [ "./emdm-progress-bar.component.css" ]
})
export class EmdmProgressBarComponent {
    @Input() progress: number; // the total progress (out of 100%)
}
