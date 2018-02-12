import { Component, OnInit, ElementRef, Input, forwardRef, EventEmitter, Output, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { FilterPipe } from '../pipes/filter.pipe';
import { Utils } from '../utils';

declare var $: any;

// combo-box to display a list of primary attribute values
@Component({
    selector: 'emdm-combobox',
    templateUrl: './emdm-combobox.component.html',
    styleUrls: [ "./emdm-combobox.component.css" ],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => EmdmComboBoxComponent),
            multi: true
        }
    ],
    host: {
        '(document:click)': 'onClickOutside($event)'
    }
})
export class EmdmComboBoxComponent implements OnInit, ControlValueAccessor {
    private oldSearchTerm: string; // keeps track of the previous search term
    private _currentAttrVal: any; // the current selected item
    private initialValue = {masterAttrValLongName: "--- Please select ---", masterAttrValCode: null};

    @Input() attrValList: any[]; // the complete list of possible attribute values
    @Input() invalid: boolean; // indicates if the selected data is invalid

    @ViewChild("list") listEl: ElementRef;
    @ViewChildren("listItemEls") listItemEls: QueryList<ElementRef>;
  
    tempCurrent: any; // the highlighted element
    searchTerm: string; // the search text in the text-part of the combobox
    currentAttrList: any[]; // the filtered list of possible attribute values
    showList: boolean; // boolean to determine if the list needs to be shown

    // get index of selected item from the available list. search param will be applicable on list, if any
    private getSelectedIndex(): number {
        for(var i=0; i<this.currentAttrList.length; i++){
            if(!Utils.isEmpty(this.tempCurrent) && this.tempCurrent.masterAttrValCode === this.currentAttrList[i].masterAttrValCode)
                return i;
        }
        return -1;
    }

    // Handles navigation through the list on arrow up or arrow down keys
    private moveCurrentIndex(moveDirection) {
        let currentIndex = this.getSelectedIndex();
        let listSize = this.currentAttrList.length;

        if(currentIndex === -1)
            this.tempCurrent = this.initialValue;
        else{
            if(moveDirection === "down")
                currentIndex = (currentIndex + 1) % listSize;
            else
                currentIndex = currentIndex===0 ? listSize-1 : --currentIndex;

            this.tempCurrent = this.currentAttrList[ currentIndex ];
            // this.elementRef.nativeElement.querySelectorAll(".attr-list li")[currentIndex].scrollIntoView(false);
        }
    }

    constructor(private elementRef: ElementRef) { }

    ngOnInit() {
        this.currentAttrList = this.attrValList;
    }

    ngAfterViewChecked() {
        if(this.showList) {
            let elementToFocus = this.listItemEls.find((listItem, i, array) => {
                return listItem.nativeElement.className.indexOf("active") >= 0;
            });

            let viewableWindow = {
                start: this.listEl.nativeElement.scrollTop,
                end: this.listEl.nativeElement.scrollTop + this.listEl.nativeElement.offsetHeight
            };
            let itemOffset = {
                start: elementToFocus.nativeElement.offsetTop,
                end: elementToFocus.nativeElement.offsetTop + elementToFocus.nativeElement.offsetHeight
            };

            // scroll if item is not already within viewable window
            if(itemOffset.end > viewableWindow.end) {
                this.listEl.nativeElement.scrollTop += itemOffset.end - viewableWindow.end + 5;
            } 
            else if(viewableWindow.start > itemOffset.start) {
                this.listEl.nativeElement.scrollTop -= viewableWindow.start - itemOffset.start + 5;
            }
        }
    }

    // Checks if the searchTerm has changed and updates the UI accordingly
    ngDoCheck() {
        if (this.searchTerm !== this.oldSearchTerm) {
            this.refreshList();
            this.oldSearchTerm = this.searchTerm;

            let currentIndex = this.getSelectedIndex();
            if(currentIndex === -1 && this.currentAttrList[0]){
                this.tempCurrent = this.currentAttrList[0];
            } else if(currentIndex !== -1 && this.currentAttrList[currentIndex]){
                // setTimeout(() => this.elementRef.nativeElement.querySelectorAll(".attr-list li")[currentIndex].scrollIntoView(false));
            }
        }
    }

    // searches by the searchTerm and updates the list
    refreshList() {
        let filterPipe = new FilterPipe();
        this.currentAttrList = filterPipe.transform(this.attrValList, { masterAttrValLongName: this.searchTerm });
        this.currentAttrList.unshift(this.initialValue);
    }

    // saves the item selected by user
    setAttrVal(attr) {
        this.showList = false;
        this.tempCurrent = attr;
        this.currentAttrVal = attr;
        this.searchTerm = attr.masterAttrValLongName;
        this.onChange(this.currentAttrVal);        
    }

    // Toggles show-hide of list on dropdown arrow click
    toggleListDisplay() {
        this.showList = !this.showList;
        this.searchTerm = this.showList ? "" : this.currentAttrVal.masterAttrValLongName;
    }

    // Helps in navigation through the list
    navigateList(event) {
        event.preventDefault();
        event.stopPropagation();
        if(event.keyCode === 27) { // Esc key
            this.showList = false;
        }
        else if(event.keyCode === 38) { // arrow up
            this.showList && this.moveCurrentIndex("up");
        }
        else if(event.keyCode === 40) { // arrow down
            if(this.showList)
                this.moveCurrentIndex("down");
            else
                this.searchTerm = "";
        }
        // if not tab, shift or keys
        if([9, 16, 17, 13, 27].indexOf(event.keyCode)===-1){
            this.showList = true;
            this.refreshList();
        }
    }

    // handles tab events
    handleKeyDown(event) {
        if(event.keyCode === 9 || event.keyCode === 13) { // select item on tab or enter key
            this.setAttrVal(this.tempCurrent);
            setTimeout(() => this.showList = false, 200);
        }
    }

    stopParentScroll(event: WheelEvent) {
        let el = this.listEl.nativeElement;
        let stopConditions = ((el.scrollTop + el.offsetHeight > el.scrollHeight) && event.deltaY > 0)
            || (el.scrollTop===0 && event.deltaY<0);

        if(stopConditions) {
            event.stopPropagation();
            event.preventDefault();
            event.returnValue = false;
        }
    }

    // Hides the list if the user clicks outside of the component
    onClickOutside(event) {
        if (!this.elementRef.nativeElement.contains(event.target)){
            this.searchTerm = this.currentAttrVal.masterAttrValLongName;
            this.showList = false;
        }
    }

    // Implementing ControlValueAccessor interface
    onChange = (_: any) => {};

    get currentAttrVal() {
        return this._currentAttrVal;
    }

    set currentAttrVal(value) {
        this._currentAttrVal = value;
    }

    writeValue(value: any): void {
        if(value !== null || this.currentAttrList.length>0) {
            this.currentAttrVal = value!==null ? value : this.initialValue;
            this.searchTerm = this.currentAttrVal.masterAttrValLongName;
            this.oldSearchTerm = this.searchTerm;
            this.tempCurrent = this.currentAttrVal;
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void { }

    setDisabledState(isDisabled: boolean): void { }
}
