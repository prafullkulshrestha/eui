import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { Title } from '@angular/platform-browser';

import { MessageService } from '../services/message.service';
import { Subscription } from "rxjs/Subscription";

@Component({
  selector: 'item-maintenance',
  templateUrl: './item-maintenance.component.html',
  styleUrls: ['./item-maintenance.component.css']
})
export class ItemMaintenanceComponent implements OnInit, OnDestroy {

  itemViewOptions = {
    canView: true,
    canEdit: true
  };

  itemViewSubscription: Subscription;
  itemEditSubscription: Subscription;

  constructor(
    private router: Router,
    private title: Title,
    private messageService: MessageService
  ) { }

  ngOnInit() {
    this.title.setTitle("Item Maintenance");
    this.itemViewSubscription = this.messageService.onItemView$.subscribe((item) => this.onItemView(item));
    this.itemEditSubscription = this.messageService.onItemEdit$.subscribe((item) => this.onItemEdit(item));
  }

  onItemView(item: any) {
    alert("View Item: " + item.itemSkey);
  }

  onItemEdit(item: any) {
    this.router.navigate(["edit-item/published/", item.itemSkey]);
  }

  ngOnDestroy() {
    this.itemViewSubscription.unsubscribe();
    this.itemEditSubscription.unsubscribe();
  }

}
