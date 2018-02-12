import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessageService {
    private onItemCloneSource = new Subject<any>();
    private onItemMatchSource = new Subject<any>();
    private onItemCompareSource = new Subject<any>();
    private onSearchCompleteSource = new Subject<any>();
    private onComboItemLinkSource = new Subject<any>();
    private onItemViewSource = new Subject<any>();
    private onItemEditSource = new Subject<any>();

    // emits new data whenever an item is about to be cloned
    onItemClone$ = this.onItemCloneSource.asObservable();

    // emits new data whenever an item is about to be matched
    onItemMatch$ = this.onItemMatchSource.asObservable();

    // emits new data whenever an item is about to be compared
    onItemCompare$ = this.onItemCompareSource.asObservable();

    // emits new data whenever an item is about to be linked to a combo
    onComboItemLink$ = this.onComboItemLinkSource.asObservable();

    // emits new data whenever an item needs to be viewed
    onItemView$ = this.onItemViewSource.asObservable();

    // emits new data whenever an item needs to be viewed
    onItemEdit$ = this.onItemEditSource.asObservable();

    // informs subscribers about the item being cloned
    cloneItem(item: any) {
        this.onItemCloneSource.next(item);
    }

    // informs subscribers about the item being matched
    matchItem(item: any) {
        this.onItemMatchSource.next(item);
    }

    // informs subscribers about the item being compared
    compareItem(item: any) {
        this.onItemCompareSource.next(item);
    }

    // informs subscribers about the item being linked to a combo
    linkToComboItem(item: any) {
        this.onComboItemLinkSource.next(item);
    }

    // informs subscribers about the item that needs to be viewed
    viewItem(item: any) {
        this.onItemViewSource.next(item);
    }

    // informs subscribers about the item that needs to be edited
    editItem(item: any) {
        this.onItemEditSource.next(item);
    }
}