import { Component, AfterViewChecked, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

import { Utils } from "../../core/utils";

declare var $: any;

@Component({
    selector: 'emdm-modal',
    templateUrl: './emdm-modal.component.html',
    styleUrls: ['./emdm-modal.component.css']
}) 
export class EmdmModal implements AfterViewInit, AfterViewChecked {

    @Input() title: string;
    @ViewChild("modal") modal: ElementRef;

    show() {
        $(this.modal.nativeElement).modal('show');
    }

    hide() {
        $(this.modal.nativeElement).modal('hide');
    }

    ngAfterViewInit() {
        $(this.modal.nativeElement).find(".btn").css("min-width", "100px");
    }

    ngAfterViewChecked() {
        if($(this.modal.nativeElement).css("display") === "block") {
            let defaultActionButton = $(this.modal.nativeElement).find(".btn-primary")[0];
            if(!Utils.isEmpty(defaultActionButton))
                $(defaultActionButton).focus();
        }
    }
}
