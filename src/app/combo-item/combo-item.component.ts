import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: '[combo-item]',
  templateUrl: './combo-item.component.html',
  styleUrls: ['./combo-item.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ComboItemComponent implements OnInit {

  @Input() item;
  @Input() mode: string;

  quantityError: string = "";

  constructor() { }

  ngOnInit() {
  }

  // validates entered quantity
  onQuantityChange(changedQuantity) {
    this.item.quantity = changedQuantity;

    if(!isNaN(changedQuantity) && changedQuantity > 0) {
      this.quantityError = "";
    }
    else {
      this.quantityError = "Quantity must be greater than zero.";
    }
  }
}
