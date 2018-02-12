import { Component, OnInit, OnChanges, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { NgForm, FormControl, FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { Params, ActivatedRoute, Router } from "@angular/router";
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs/Observable';
import { FileUploader } from 'ng2-file-upload';
import 'rxjs/add/operator/toPromise';

import { EmdmModal } from '../core/components/emdm-modal.component';
import { EmdmCollapsiblePanel } from "app/core/components/emdm-collapsible-panel.component";

import { Utils } from '../core/utils';
import { Common } from '../common';

import { ItemsAttributeService } from '../services/items-attribute.service';
import { ItemsService } from '../services/items.service';
import { WorkflowsService } from '../services/workflows.service';
import { EmdmUtilService } from '../services/emdm-util.service';
import { DataStoreService } from '../services/data-store.service';
import { MessageService } from '../services/message.service';

import { environment } from '../../environments/environment';
import { Workflows } from "../config/workflow/workflows";
import { Subscription } from "rxjs/Subscription";

declare var $: any;

@Component({
  selector: 'app-item-creation',
  templateUrl: './item-creation.component.html',
  styleUrls: ['./item-creation.component.css'],
  host: {
    '(document:scroll)': 'onDocumentScroll()'
  }
})
export class ItemCreationComponent implements OnInit, OnChanges, OnDestroy {
  private currentItemFormData: any;

  @ViewChild("sourceInfoEl") sourceInfoEl: ElementRef;

  item: any = {};
  mode: string = null;

  showWelcomeMessage: boolean = true;
  sourceInfo: any = null;
  publishProgress: number = 0;
  secondaryAttrsFillProportion: string = "";
  saveFormLoaded: boolean = false;
  loadItemForm: boolean = false;
  effStartDateDefault = new Date('1900-01-01');
  effEndDateDefault = new Date('2999-12-31');
  externalResources: any[] = [];

  // form for cloning from an item
  newItemForm: FormGroup;
  newItem: any = {};
  newItemFormActive: boolean = false;

  // holds a ref to currently selected related item and the entire search request object
  relatedItem: any = {
    current: null,
    searchReqObj: null,
    itemViewOptions: { // configures action buttons available in related items
      canClone: true,
      canCompare: true
    }
  }

  itemCloneSubscription: Subscription;
  itemCompareSubscription: Subscription;

  fixedPublishProgressBar: boolean = false;
  fixedSourceInfoBox: boolean = false;

  constructor(private fb: FormBuilder,
    private title: Title,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private itemsAttributeService: ItemsAttributeService,
    private itemsService: ItemsService,
    private emdmUtilService: EmdmUtilService,
    private workflowsService: WorkflowsService,
    private dataStoreService: DataStoreService,
    private messageService: MessageService
  ) {
    this.createNewItemForm();
  }

  // builds the new item form while cloning
  private createNewItemForm() {
    this.newItemForm = this.fb.group({
      upc: [''],
      primaryAttributesFormArray: this.fb.array([]),
      secondaryAttributesFormArray: this.fb.array([])
    });
  }

  // populates the fields of the new item while cloning
  private prepareNewItemForm() {
    this.newItem.upc = this.currentItemFormData.upc;
    this.newItem.sector = this.currentItemFormData.industrySector;
    this.newItem.segment = this.currentItemFormData.industrySegment;
    this.newItem.class = this.currentItemFormData.industryClass;

    Common.setAttrValuesForItem(this.newItem, this.currentItemFormData.attributes);

    let primaryAttributesFormControls = this.newItem.primaryAttributes.map(() => this.fb.control(null));
    let secondaryAttributesFormControls = this.newItem.secondaryAttributes.map(() => this.fb.control(null));
    this.newItemForm.setControl("primaryAttributesFormArray", this.fb.array(primaryAttributesFormControls));
    this.newItemForm.setControl("secondaryAttributesFormArray", this.fb.array(secondaryAttributesFormControls));
  }

  ngOnInit() {
    this.title.setTitle("Item Creation");
    this.itemCloneSubscription = this.messageService.onItemClone$.subscribe((item) => this.onItemClone(item));
    this.itemCompareSubscription = this.messageService.onItemCompare$.subscribe((item) => this.onItemCompare(item));

    this.route.params
      .subscribe((params: Params) => {
        let itemSkey = params["itemSkey"];
        this.loadItemForm = false;
        this.saveFormLoaded = false;
        this.item = null;
        this.mode = this.route.snapshot.data['mode'];

        if (Utils.isEmpty(itemSkey)) { // new item
          this.showWelcomeMessage = true;
          if (!Utils.isEmpty(this.dataStoreService.getSourceInfo())) {
            this.showWelcomeMessage = false;
            this.sourceInfo = this.dataStoreService.getSourceInfo();
            this.dataStoreService.setSourceInfo(null);
          }

          if (!Utils.isEmpty(this.dataStoreService.getItemToCreate())) {
            this.item = this.dataStoreService.getItemToCreate();
            this.dataStoreService.setItemToCreate(null);
          }

          this.loadItemForm = true;
        }
        else { // editing a draft item
          this.showWelcomeMessage = false;

          this.itemsService.getItemMaster(itemSkey)
            .then((response) => {
              this.item = response;
              this.loadItemForm = true;
            }, (error) => {
              if (error.status !== 401)
                this.router.navigate(["i-don't-care"], { skipLocationChange: true });
            });
        }
      });
  }

  ngOnChanges() {
    this.relatedItem.searchReqObj = null;
  }

  getItemDesc(primaryAttributes, secondaryAttributes, type) {
    return Common.getItemDesc(primaryAttributes, secondaryAttributes, type);
  }

  onItemFormChanged(formData) {
    if ((Utils.isEmpty(formData.industrySector) || Utils.isEmpty(formData.industrySegment)
      || Utils.isEmpty(formData.industryClass)) && Utils.isEmpty(this.sourceInfo)) {
      this.showWelcomeMessage = true;
      this.saveFormLoaded = false;
      this.externalResources = [];
      this.currentItemFormData = null;
      this.relatedItem.searchReqObj = null;
    }
    else {
      let extraAttrs = 4; // 4 is added for sector, segment, class and upc
      let countUPC = Utils.isEmpty(formData.upc) ? 1 : 0;
      this.showWelcomeMessage = false;
      this.saveFormLoaded = true;
      this.externalResources = this.itemsAttributeService
        .getExternalLinks(formData.industrySector, formData.industrySegment, formData.industryClass);

      setTimeout(() => {
        if (formData.totalPrimary > 0)
          this.publishProgress = ((formData.primaryAttributes.length + extraAttrs - countUPC)
            / (formData.totalPrimary + extraAttrs)) * 100;
      });

      let shouldRefreshRelatedItems = false;
      if (!Utils.isEmpty(this.currentItemFormData) && this.currentItemFormData.industryClass !== formData.industryClass)
        shouldRefreshRelatedItems = true;

      this.currentItemFormData = formData;
      this.loadRelatedItems(shouldRefreshRelatedItems);
    }
    this.cdr.detectChanges();
  }

  // refreshing related items
  loadRelatedItems(refresh) {
    let reqObj = this.currentItemFormData;
    if (Utils.isEmpty(reqObj.industrySector) || Utils.isEmpty(reqObj.industrySegment) || Utils.isEmpty(reqObj.industryClass)) {
      return;
    }

    if (refresh || Utils.isEmpty(this.relatedItem.searchReqObj)) {

      let attributes = reqObj.primaryAttributes.concat(reqObj.secondaryAttributes);

      this.relatedItem.searchReqObj = {
        pageNo: 0,
        pageSize: environment.pageSize,
        upc: reqObj.upc,
        industrySector: reqObj.industrySector,
        industrySegemnt: reqObj.industrySegment,
        industryClass: reqObj.industryClass,
        state: "PUBLISH",
        attributes: attributes
      };
    }
  }

  // shows the dialog to clone an item from a related item
  showCloneDialog(item) {
    this.itemsAttributeService
      .getAttributes({
        industrySector: this.currentItemFormData.industrySector,
        industrySegment: this.currentItemFormData.industrySegment,
        industryClass: this.currentItemFormData.industryClass
      })
      .then((response) => {
        let attributes = response;

        this.newItem.primaryAttributes = Common.getOrderedAttrList(attributes, "PRIMARY");
        this.newItem.secondaryAttributes = Common.getOrderedAttrList(attributes, "SECONDARY");
        this.prepareNewItemForm();
        this.relatedItem.current = item;
        this.newItemFormActive = true;
        setTimeout(() => $("#itemCloneModal").modal('show'));
      });
  }

  // copies from a related item to the new item being created. hides the cloning modal dialog
  hideCloneDialog() {
    let clonedItem: any = {};
    let newItemFormValues = this.newItemForm.value;
    let primaryAttributes = Common.buildAttrsReqObj(this.newItem.primaryAttributes, newItemFormValues.primaryAttributesFormArray);
    let secondaryAttributes = Common.buildAttrsReqObj(this.newItem.secondaryAttributes, newItemFormValues.secondaryAttributesFormArray);
    clonedItem.upc = this.newItem.upc;
    clonedItem.attributes = primaryAttributes.concat(secondaryAttributes);
    if (!Utils.isEmpty(clonedItem.upc) || clonedItem.attributes.length > 0) {
      clonedItem.effStartDt = this.effStartDateDefault;
      clonedItem.effEndDt = this.effEndDateDefault;
    }
    this.item = clonedItem;
    this.newItemFormActive = false;
    $("#itemCloneModal").modal('hide');
  }

  // clones a related item
  cloneRelatedItem() {
    let newItemAttrs = this.newItem.primaryAttributes.concat(this.newItem.secondaryAttributes)
      .map((attr) => ({ attrName: attr.masterAttrName }));

    let relatedItemAttrs = this.relatedItem.current.primaryAttributes.concat(this.relatedItem.current.secondaryAttributes);
    for (var i = 0; i < newItemAttrs.length; i++) {
      var tAttr = newItemAttrs[i].attrValue;
      var rAttr = relatedItemAttrs[i].attrValue;
      var type = newItemAttrs[i].masterAttrType;

      if (!Utils.isEmpty(rAttr) && !Utils.isEmpty(newItemAttrs[i]) && newItemAttrs[i].fieldType === "COMBO") {
        let temp = Utils.isEmpty(tAttr) ? {} : tAttr;
        temp.masterAttrValCode = rAttr.attrCode;
        temp.masterAttrValLongName = rAttr.attrLongName;
        temp.masterAttrValShortName = rAttr.attrShortName;
        temp.classAttrValSkey = rAttr.classAttrValSkey;
        newItemAttrs[i].attrValue = temp;
      }
      else {
        newItemAttrs[i].attrValue = rAttr;
      }
    }

    this.newItem.upc = this.relatedItem.current.upc;
    Common.setAttrValuesForItem(this.newItem, newItemAttrs);
  }

  // TODO: dummy function to be coded later
  onItemCompare(item) {
    alert("Comparing " + item.itemSkey + " with upc " + item.upc);
  }

  // called when an unmatched item is matched to an item master
  onItemClone(item) {
    this.showCloneDialog(item);
  }

  // called when document is scrolled
  onDocumentScroll() {
    this.fixedPublishProgressBar = $(document).scrollTop() >= 80;
    if($(document).height() - $(window).height() > $(this.sourceInfoEl.nativeElement).height() + 100) {
      this.fixedSourceInfoBox = $(document).scrollTop() >= 100;
    }
  }

  ngOnDestroy() {
    this.itemCloneSubscription.unsubscribe();
    this.itemCompareSubscription.unsubscribe();
  }
}
