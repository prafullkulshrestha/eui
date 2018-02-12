import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';

import { MessageService } from '../services/message.service';
import { ItemsService } from '../services/items.service';

import { Utils } from '../core/utils';
import { Common } from '../common';

@Component({
    selector: '[display-item]',
    templateUrl: './display-item.component.html',
    styleUrls: ['./display-item.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class DisplayItemComponent implements OnInit {
    @Input() item: any; // the item to display
    @Input() itemViewOptions;

    componentItems = [];
    secondaryAttrsFillProportion: string;

    private comboItemMap = (item, quantity) => {
        return {
            itemSkey: item.itemSkey,
            description: item.shortDescription,
            upc: item.upc,
            quantity: quantity
        }
    }

    constructor(
        private messageService: MessageService,
        private itemsService: ItemsService
    ) { }

    ngOnInit() {
        let filledAttrs = 0;
        this.item.secondaryAttributes.forEach(element => {
            if (!Utils.isEmpty(element.value))
                filledAttrs++;
        });

        this.secondaryAttrsFillProportion = filledAttrs + "/" + this.item.secondaryAttributes.length;
        this.fetchComponentItems();
    }

    fetchComponentItems() {
        let componentItemPromises = (this.item.componentItems || [])
            .map((item) => this.itemsService.getItemMaster(item.itemSkey));

        Promise.all(componentItemPromises)
            .then((itemResponses) => {
                this.componentItems = [];
                for (let i = 0; i < itemResponses.length; i++) {
                    this.componentItems.push(this.comboItemMap(itemResponses[i], this.item.componentItems[i].quantity));
                }
            });
    }

    compareItem(item: any) {
        this.messageService.compareItem(item);
    }

    cloneItem(item: any) {
        this.messageService.cloneItem(item);
    }

    matchItem(item: any) {
        this.messageService.matchItem(item);
    }

    linkToComboItem(item: any) {
        this.messageService.linkToComboItem(item);
    }

    viewItem(item: any) {
        this.messageService.viewItem(item);
    }

    editItem(item: any) {
        this.messageService.editItem(item);
    }
}