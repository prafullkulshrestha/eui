import { Component, OnInit, ElementRef, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Utils } from '../utils';

//  from drop down component to let user select an item from a list
@Component({
    selector: 'emdm-dropdown',
    templateUrl: './emdm-dropdown.component.html',
    styleUrls: [ "./emdm-dropdown.component.css" ],
    providers: [
        { 
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmdmDropdownComponent),
            multi: true
        }
    ],
    host: {
        '(document:click)': 'onClickOutside($event)'
    }
})
export class EmdmDropdownComponent implements ControlValueAccessor {
    private _currentVal: any = null; // the current selected item
    private initialValue = {text: "--- Please select ---", value: null};

    @Input() items: any[]; // the complete list of items in the dropdown
    @Input() disable: boolean = false; // determines if the control should be disable

    tempCurrent: any; // the highlighted element
    showList: boolean; // boolean to determine if the list needs to be shown
    selectionText: string = ''; // text shown to the user for a dropdown

    // get index of selected item from the available items
    private getSelectedIndex(): number {
        for(var i=0; i<this.items.length; i++){
            if(this.tempCurrent && this.tempCurrent!==null && this.tempCurrent.value === this.items[i].value)
                return i;
        }
        return -1;
    }

    // Handles navigation through the list on arrow up or arrow down keys
    private moveCurrentIndex(moveDirection) {
        let currentIndex = this.getSelectedIndex();
        let listSize = this.items.length;

        if(currentIndex === -1)
            this.tempCurrent = this.items[0];
        else{
            if(moveDirection === "down")
                currentIndex = (currentIndex + 1) % listSize;
            else
                currentIndex = currentIndex===0 ? listSize-1 : --currentIndex;

            this.tempCurrent = this.items[ currentIndex ];
            // this.elementRef.nativeElement.querySelectorAll(".attr-list li")[currentIndex].scrollIntoView(false);
        }
    }

    constructor(private elementRef: ElementRef) { }

    // saves the item selected by user
    setCurrentVal(value) {
        if(!Utils.isEmpty(this.currentVal) && this.currentVal.value === value.value) {
            this.showList = false;
            return;
        }

        this.showList = false;
        this.tempCurrent = value;
        this.currentVal = value;
    }

    // Toggles show-hide of list on dropdown arrow click
    toggleListDisplay() {
        if(this.disable) return;

        this.showList = !this.showList;
    }

    // Helps in navigation through the list
    navigateList(event) {
        if(this.disable) return;

        if([27, 38, 40].indexOf(event.keyCode) >= 0){
            event.preventDefault();
            event.stopPropagation();
        }

        if(event.keyCode === 27) { // Esc key
            this.showList = false;
        }
        else if(event.keyCode === 38) { // arrow up
            if(!this.showList)
                this.showList = true;
            else
                this.moveCurrentIndex("up");
        }
        else if(event.keyCode === 40) { // arrow down
            if(!this.showList)
                this.showList = true;
            else
                this.showList && this.moveCurrentIndex("down");
        }
    }

    // handles tab and shift+tab events
    handleKeyDown(event) {
        if(this.disable) return;

        if(event.code === "Tab" || event.keyCode === 13) { // select item on tab or enter key
            if(this.showList) {
                this.setCurrentVal(this.tempCurrent);
                setTimeout(() => this.showList = false);
            }
        }
    }

    // Hides the list if the user clicks outside of the component
    onClickOutside(event) {
        if (!this.elementRef.nativeElement.contains(event.target)){
            this.showList = false;
        }
    }

    // Implementing ControlValueAccessor interface
    propagateChange = (_: any) => {};

    get currentVal() {
        return this._currentVal;
    }

    set currentVal(value) {
        this._currentVal = value;
        this.selectionText = value.text;
        this.propagateChange(this.currentVal);
    }

    writeValue(value: any): void {
        this.currentVal = Utils.isEmpty(value) ? this.initialValue : value;
        this.tempCurrent = this.currentVal;
    }

    registerOnChange(fn: any): void {
        this.propagateChange = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState(isDisabled: boolean): void { }
}
