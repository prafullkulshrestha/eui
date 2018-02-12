import { Component, OnChanges, Input, Output, ViewEncapsulation, EventEmitter } from '@angular/core';
import { ItemsService } from '../services/items.service';
import { ItemsAttributeService } from '../services/items-attribute.service';
import { Utils } from '../core/utils';
import { Common } from '../common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'item-search',
  templateUrl: './item-search.component.html',
  styleUrls: ['./item-search.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ItemSearchComponent implements OnChanges {

  @Input() query: any;
  @Input() itemViewOptions: any;
  @Output() onSearchComplete: EventEmitter<any> = new EventEmitter();

  searchResults: any[] = [];
  searchResultCount: number = 0;
  pageSize: number = environment.pageSize;
  currentPageNo: number;
  totalResultCount: number;
  hasError: boolean = false;

  private loadSearchResults() {
    this.itemsService
      .getItemSearchResults(this.query)
      .then((data) => {
        this.totalResultCount = data.itemCount;
        if (!this.query.pageNo || this.query.pageNo === 0) {
          this.searchResultCount = 0;
          this.searchResults = [];
        }

        this.searchResultCount += data.relatedItems.length;
        data.relatedItems.forEach((item) => {
          item.effStartDt = Utils.transformDate(item.effStartDt, "MM/dd/yyyy");
          item.effEndDt = Utils.transformDate(item.effEndDt, "MM/dd/yyyy");
          this.itemsAttributeService
            .getAttributes({
              industrySector: item.industrySector,
              industrySegment: item.industrySegment,
              industryClass: item.industryClass
            })
            .then((attrs) => {
              let attributes = attrs.slice().map((attr) => Utils.deepCopy(attr));
              let displayFormat = {
                primaryAttributes: Common.getOrderedAttrList(attributes, "PRIMARY"),
                secondaryAttributes: Common.getOrderedAttrList(attributes, "SECONDARY")
              };
              this.searchResults.push(Common.prepareItemForDisplay(displayFormat, item));

            });
        });

        this.onSearchComplete.emit();
      }, (error) => {
        this.hasError = true;
        this.onSearchComplete.emit();
        console.log("Could not load search results", error);
      });
  }

  constructor(
    private itemsService: ItemsService,
    private itemsAttributeService: ItemsAttributeService
  ) { }

  ngOnChanges() {
    if (Utils.isEmpty(this.query)) return;

    this.hasError = false;
    this.currentPageNo = this.query.pageNo;
    this.loadSearchResults();
  }

  loadMore() {
    this.query.pageNo = ++this.currentPageNo;
    this.loadSearchResults();
  }
 }
