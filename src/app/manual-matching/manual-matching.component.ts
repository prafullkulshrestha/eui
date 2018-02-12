import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgForm, FormControl, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Title } from '@angular/platform-browser'
import { Observable } from 'rxjs/Observable';
import { FileUploader } from 'ng2-file-upload';
import 'rxjs/add/operator/toPromise';

import { ItemsAttributeService } from '../services/items-attribute.service';
import { ItemsService } from '../services/items.service';
import { ManualMatchingItemsService } from '../services/manual-matching-items.service';
import { DataStoreService } from '../services/data-store.service';
import { MessageService } from '../services/message.service';
import { Utils } from '../core/utils';
import { Common } from '../common';
import { environment } from '../../environments/environment';
import { Workflows } from "../config/workflow/workflows";
import { WorkflowsService } from '../services/workflows.service';
import { Subscription } from "rxjs/Subscription";
declare var $: any;
@Component({
  selector: 'app-manual-matching',
  templateUrl: './manual-matching.component.html',
  styleUrls: ['./manual-matching.component.css'],
  host: {
    '(document:scroll)': 'onDocumentScroll()'
  }
})
export class ManualMatchingComponent implements OnInit, OnDestroy {
  private prevSSC: any = { sector: null, segment: null, class: null };
  private workflows: Workflows = new Workflows();

  @ViewChild("sourceInfoEl") sourceInfoEl: ElementRef;

  sourceInfo: any = null;
  currentWorkItemSkey: number;
  itemSkeySearchVal: string = "";
  externalResources: any[] = [];
  comments: any = [];
  attributeList: any = {};
  matchedAttrs: any = null;
  pageSize: number = environment.pageSize;
  secondaryAttrsFillProportion = "";
  itemReqObj: any = {};

  suggestion = {
    keys: [],
    items: []
  };
  showPreFilledResults: boolean = false;

  itemViewOptions = {
    canCompare: true,
    canMatch: true
  }

  showSearchForm = false;

  itemMatchSubscription: Subscription;
  itemCompareSubscription: Subscription;

  fixedSourceInfoBox: boolean = false;

  constructor(private title: Title,
    private router: Router,
    private route: ActivatedRoute,
    private itemsAttributeService: ItemsAttributeService,
    private itemsService: ItemsService,
    private manualMatchingItemsService: ManualMatchingItemsService,
    private dataStoreService: DataStoreService,
    private messageService: MessageService,
    private workflowsService: WorkflowsService) { }

  // load all suggested items - of a manual matching workflow item
  private loadSuggestedItems(itemSkeys): Promise<any> {
    if (Utils.isEmpty(itemSkeys) || itemSkeys.length === 0) { // load search form directly if there no suggested items
      this.showSearchForm = true;
      this.showPreFilledResults = false;
      return Promise.resolve({});
    }

    let itemPromises = [];
    itemSkeys.forEach((itemSkey) => {
      itemPromises.push(this.itemsService.getItemMaster(itemSkey.itemSkey));
    });

    return Promise.all(itemPromises)
      .then((itemResponses) => {
        let entityQualifiers = itemResponses.map((response) => {
          return {
            key: response.industrySector + "_" + response.industrySegment + "_" + response.industryClass,
            sector: response.industrySector,
            segment: response.industrySegment,
            class: response.industryClass
          }
        })
          .filter((cls, index, collection) => collection.indexOf(cls) === index);
        let atrributePromises = [];
        entityQualifiers.forEach((enitityQualifier) => {
          atrributePromises.push(this.itemsAttributeService.getAttributes({
            industrySector: enitityQualifier.sector,
            industrySegment: enitityQualifier.segment,
            industryClass: enitityQualifier.class
          }));
        });

        Promise.all(atrributePromises)
          .then((attributeResponses) => {
            for (let i = 0; i < attributeResponses.length; i++) {
              this.attributeList[entityQualifiers[i].key] = {
                primaryAttributes: Common.getOrderedAttrList(attributeResponses[i], "PRIMARY"),
                secondaryAttributes: Common.getOrderedAttrList(attributeResponses[i], "SECONDARY")
              };
            }

            itemResponses.forEach((item) => {
              this.suggestion.items.push(
                Common.prepareItemForDisplay(this.attributeList[item.industrySector + "_" + item.industrySegment + "_" + item.industryClass], item)
              );
            });

            this.matchedAttrs = Common.getMatchingAttributes(itemResponses);
          }, (error) => {
            console.log("Could not load attributes for suggested items", error);
          });
      }, (error) => {
        console.log("Could not load suggestions", error);
      });
  }

  // load source info and suggested items of a given workflow itemSkey
  private loadWorkflowItem(workItemsSkey) {
    this.matchedAttrs = null;
    this.suggestion.items = [];
    this.showPreFilledResults = false;
    this.showSearchForm = false;

    this.manualMatchingItemsService.getWorkflowItem(workItemsSkey)
      .then((response) => {
        this.sourceInfo = {};
        this.sourceInfo.workItemSkey = workItemsSkey;
        this.sourceInfo.srcSystem = response.srcSystem;
        this.sourceInfo.standardizedUPC = response.upc14;
        this.sourceInfo.upc = response.upcCode;
        this.sourceInfo.uom = response.uom;
        this.sourceInfo.upcDesc = response.upcDesc;
        this.sourceInfo.entItemUnivId = response.entItemUnivId;

        this.suggestion.keys = response.suggestedItemSkey;
        this.loadSuggestedItems(this.suggestion.keys)
          .then(() => {
            this.showPreFilledResults = true;
            this.showSearchForm = true;
          });
      }, (error) => {
        console.log("Could not load workflow item " + workItemsSkey, error);
        if (error.status !== 401)
          this.router.navigate(["i-don't-care"], { skipLocationChange: true });
      });
  }

  ngOnInit() {
    this.title.setTitle("Manual Matching");
    this.itemMatchSubscription = this.messageService.onItemMatch$.subscribe((item) => this.onItemMatch(item));
    this.itemCompareSubscription = this.messageService.onItemCompare$.subscribe((item) => this.onItemCompare(item));

    // code to allow easy testing. should be removed later
    this.route.params
        .subscribe((params: Params) => { 
          this.currentWorkItemSkey = params["workItemsSkey"];
          this.loadWorkflowItem(this.currentWorkItemSkey); 
        });
  }

  // create a new master for an unmatched manual matching item
  createNewMaster() {
    this.dataStoreService.setSourceInfo(null);
    this.dataStoreService.setItemToCreate(null);

    // if attribute list is loaded
    if (this.showSearchForm) {
      let itemReqObj = {
        upc: this.itemReqObj.upc,
        industrySector: this.itemReqObj.industrySector,
        industrySegment: this.itemReqObj.industrySegment,
        industryClass: this.itemReqObj.industryClass,
        attributes: this.itemReqObj.attributes
      };
      
      this.dataStoreService.setSourceInfo(this.sourceInfo);
      this.dataStoreService.setItemToCreate(itemReqObj);
    }
    this.router.navigate(["/item-creation"]);
  }

  onSearchValueChanged(formData) {
    this.itemReqObj = formData;
    setTimeout(() => {
      this.externalResources = this.itemsAttributeService
        .getExternalLinks(formData.industrySector, formData.industrySegment, formData.industryClass);
    });
  }

  // TODO: dummy function to be coded later
  onItemCompare(item) {
    alert("Comparing " + item.itemSkey + " with upc " + item.upc);
  }

  // called when an unmatched item is matched to an item master
  onItemMatch(item) {
    let wfModelId = this.workflows.itemManualMatching.wfModel.id;

    this.manualMatchingItemsService.matchWorkflowItem({
      workItemSkey: this.currentWorkItemSkey,
      itemMasterSkey: item.itemSkey,
      entItemUnivId: this.sourceInfo.entItemUnivId,
      comments: this.comments
    })
      .then((response) => {
        if (response.status === "success") {
          // Update the workflow also
          this.workflowsService.executeWorkflowAction("Match", "Tier5", wfModelId, this.currentWorkItemSkey)
            .then(() => {
              alert("Workflow item " + this.currentWorkItemSkey + " matched with master item " + item.itemSkey);
            });
        }
        else
          alert("Failed matching workflow item " + this.currentWorkItemSkey + " to master item " + item.itemSkey);
      }, () => {
        alert("Some error occured while matching workflow item " + this.currentWorkItemSkey);
      });
  }

  // called when document is scrolled
  onDocumentScroll() {
    if($(document).height() - $(window).height() > $(this.sourceInfoEl.nativeElement).height() + 80) {
      this.fixedSourceInfoBox = $(document).scrollTop() >= 80;
    }
  }

  ngOnDestroy() {
    this.itemMatchSubscription.unsubscribe();
    this.itemCompareSubscription.unsubscribe();
  }
}
