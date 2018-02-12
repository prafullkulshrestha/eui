import { Component, Input, Output, OnInit, OnChanges, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from "@angular/forms";

import { ItemsAttributeService } from "../services/items-attribute.service";
import { Utils } from '../core/utils';
import { Common } from '../common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'item-search-tab-view',
  templateUrl: './item-search-tab-view.component.html',
  styleUrls: ['./item-search-tab-view.component.css']
})
export class ItemSearchTabViewComponent implements OnInit, OnChanges {

  @Input() inputSearchQuery;
  @Input() disableOptions;
  @Input() itemViewOptions;
  @Input() initialResults;
  @Input() isIndependentPage: boolean;
  @Output() onSearchValueChange: EventEmitter<any> = new EventEmitter();

  private prevSSC: any = { sector: null, segment: null, class: null };
  private qualiferFormChanged$: any;

  currentTab: string = "";
  searchForm: FormGroup;
  itemQualifierForm: FormGroup;
  searchData = {
    upc: "",
    primaryAttributes: null,
    secondaryAttributes: null
  };
  itemSkeySearchVal: string = "";
  searchFormActive: boolean = false;
  qualifierFormActive: boolean = false;
  submitted: boolean = false;
  sectors = [];
  segments = [];
  classes = [];
  pageSize: number = environment.pageSize;
  secondaryAttrsFillProportion = "";

  searchByAttrs = {
    name: "SEARCH_BY_ATTRS",
    initial: {
      results: [],
      numItemToShow: this.pageSize
    },
    searchReqObj: null,
    searchEnabled: false,
    resetEnabled: false,
    isSearched: false,
    showResults: false
  };

  searchByID = {
    name: "SEARCH_BY_ID",
    initial: {
      results: [],
      numItemToShow: this.pageSize
    },
    searchReqObj: null,
    searchEnabled: false,
    resetEnabled: false,
    isSearched: false,
    showResults: false
  };

  initialAttributes: any;

  constructor(
    private fb: FormBuilder,
    private itemsAttributeService: ItemsAttributeService,
  ) {
    this.createItemQualifierForm();
    this.createSearchForm();
  }

  // build item type form consisting of sector, segment and class
  private createItemQualifierForm() {
    this.itemQualifierForm = this.fb.group({
      sector: '',
      segment: '',
      class: ''
    });

    if (this.itemQualifierForm) {
      this.qualiferFormChanged$ = this.itemQualifierForm.valueChanges
        .subscribe(data => this.onItemQualifierFormValueChanged(data));
    }
  }

  // build item save form consisting of upc and all other attributes
  private createSearchForm() {
    this.searchForm = this.fb.group({
      upc: '',
      primaryAttributesFormArray: this.fb.array([]),
      secondaryAttributesFormArray: this.fb.array([])
    });

    if (this.searchForm) {
      this.searchForm.valueChanges
        .subscribe(data => this.onSearchFormValueChanged());
    }
  }

  // setup primary and secondary attributes form array. adds necessary validators to primary attributes.
  private setAttrsFormArray(attrsType, attrs): FormArray {
    let attrFormArray = [];

    for (var i = 0; i < attrs.length; i++) {
      let attr = attrs[i];
      // add control to from array
      attrFormArray.push(this.fb.control({ attrValue: [attr.attrValue] }));
    }

    return this.fb.array(attrFormArray);
  }

  // get request object for an item
  private getItemReqObj() {
    let qFormValue = this.itemQualifierForm.value;
    let searchFormValue = this.searchForm.value;

    return {
      upc: searchFormValue ? searchFormValue.upc : "",
      industrySector: !Utils.isEmpty(qFormValue.sector) ? qFormValue.sector.value : null,
      industrySegment: !Utils.isEmpty(qFormValue.segment) ? qFormValue.segment.value : null,
      industryClass: !Utils.isEmpty(qFormValue.class) ? qFormValue.class.value : null,
      attributes: this.getAttrsReqObj()
    };
  }

  // get request object for attribute set to be used for search
  private getAttrsReqObj() {
    if (!this.searchFormActive)
      return [];

    let searchFormValues: any = this.searchForm.value;
    let primaryAttrs = Common.buildAttrsReqObj(this.searchData.primaryAttributes, searchFormValues.primaryAttributesFormArray);
    let secondaryAttrs = Common.buildAttrsReqObj(this.searchData.secondaryAttributes, searchFormValues.secondaryAttributesFormArray);

    return primaryAttrs.concat(secondaryAttrs);
  }

  // initialize search form
  private initSearchForm() {
    let qFormValue = this.itemQualifierForm.value;
    if (Utils.isEmpty(qFormValue.sector.value) || Utils.isEmpty(qFormValue.segment.value)
      || Utils.isEmpty(qFormValue.class.value))
      return;

    this.searchData.upc = '';

    // load attribute form
    this.itemsAttributeService
      .getAttributes({
        industrySector: qFormValue.sector.value,
        industrySegment: qFormValue.segment.value,
        industryClass: qFormValue.class.value
      })
      .then((attrs) => {
        let attributes = attrs.slice().map((attr) => Utils.deepCopy(attr));
        this.searchData.primaryAttributes = Common.getOrderedAttrList(attributes, "PRIMARY");
        this.searchData.secondaryAttributes = Common.getOrderedAttrList(attributes, "SECONDARY");

        if (!Utils.isEmpty(this.inputSearchQuery)) {
          Common.setAttrValuesForItem(this.searchData, this.inputSearchQuery.attributes);
        }

        setTimeout(() => {
          this.initialAttributes = this.getAttrsReqObj().slice().map((t) => Utils.deepCopy(t));
        });

        this.searchForm.setControl("primaryAttributesFormArray",
            this.setAttrsFormArray("PRIMARY", this.searchData.primaryAttributes));
        this.searchForm.setControl("secondaryAttributesFormArray",
            this.setAttrsFormArray("SECONDARY", this.searchData.secondaryAttributes));

        this.searchByAttrs.resetEnabled = true;
        this.searchByAttrs.searchEnabled = true;
        this.searchFormActive = true;

        this.onSearchValueChange.emit(this.getItemReqObj());
      }, (error) => {
        console.log("Could not fetch attributes", error);
      });
  }

  private attrValueMap = (obj, fieldType) => {
    if(Utils.isEmpty(obj) || fieldType!=="COMBO")
      return obj;
    else
      return {
        masterAttrValCode: obj.attrCode,
        masterAttrValLongName: obj.attrLongName,
        masterAttrValShortName: obj.attrShortName,
        classAttrValSkey: obj.classAttrValSkey
      }
  }

  private sscMap = value => {
    if(Utils.isEmpty(value))
      return value;

    return { text: value, value: value };
  }

  private getSectors() {
    let qFormValue = this.itemQualifierForm.value;
    return this.itemsAttributeService
      .getSectors()
      .map((ssc) => this.sscMap(ssc.industrySector));
  }

  private getSegments() {
    let qFormValue = this.itemQualifierForm.value;
    return this.itemsAttributeService
      .getSegmentsBySector(qFormValue.sector.value)
      .map((item) => this.sscMap(item.industrySegment));
  }

  private getClasses() {
    let qFormValue = this.itemQualifierForm.value;
    return this.itemsAttributeService
      .getClassesBySectorSegment(qFormValue.sector.value, qFormValue.segment.value)
      .map((item) => this.sscMap(item.industryClass));
  }

  private loadSearchForm() {
    this.itemsAttributeService
      .loadSectorSegmentClass()
      .then(() => {
        this.sectors = this.itemsAttributeService
          .getSectors()
          .map((item) => { return { text: item.industrySector, value: item.industrySector } });

        if (!Utils.isEmpty(this.inputSearchQuery)) {
          this.qualifierFormSafePatch({
            sector: this.sscMap(this.inputSearchQuery.industrySector),
            segment: this.sscMap(this.inputSearchQuery.industrySegment),
            class: this.sscMap(this.inputSearchQuery.industryClass)
          });

          this.searchFormActive = false;
          this.initSearchForm();
        }

        setTimeout(() => this.qualifierFormActive = true);
      });
  }

  ngOnInit() {

  }

  ngOnChanges() {
    if (!Utils.isEmpty(this.initialResults)) {
      this.searchByAttrs.initial.results = this.initialResults;
    }
    this.loadSearchForm();
  }

  // reset the search form
  resetSearchForm(searchByAttrs) {
    if (!searchByAttrs.resetEnabled) return;

    let pValues = [], sValues = [];
    let pAttrs = this.searchData.primaryAttributes, sAttrs = this.searchData.secondaryAttributes;

    for (var i = 0; i < pAttrs.length; i++) {
      let foundAttr = this.initialAttributes.filter((attr) => attr.attrName === pAttrs[i].masterAttrName)[0];
      let attrValue = null;

      if (!Utils.isEmpty(foundAttr))
        attrValue = foundAttr.attrValue;

      pValues.push(this.attrValueMap(attrValue, pAttrs[i].fieldType));
    }

    for (var i = 0; i < sAttrs.length; i++) {
      let foundAttr = this.initialAttributes.filter((attr) => attr.attrName === sAttrs[i].masterAttrName)[0];
      let attrValue = null;

      if (!Utils.isEmpty(foundAttr))
        attrValue = foundAttr.attrValue;

      sValues.push(this.attrValueMap(attrValue, sAttrs[i].fieldType));
    }

    this.searchForm.setValue({ 
      upc: this.inputSearchQuery && this.inputSearchQuery.upc || '',
      primaryAttributesFormArray: pValues,
      secondaryAttributesFormArray: sValues
    });

    searchByAttrs.numItemsToShow = this.pageSize;
    searchByAttrs.isSearched = false;
    searchByAttrs.showResults = (!Utils.isEmpty(this.initialResults) && this.initialResults.length > 0);
  }

  // searches for available master items
  searchForMaster(searchObj) {
    if (!searchObj.searchEnabled) return;

    let searchReqObj: any = {};
    if (this.currentTab === "SEARCH_BY_SKEY") {
      if (this.itemSkeySearchVal.trim() === "")
        return;
      searchReqObj.itemSkey = this.itemSkeySearchVal;
      searchReqObj.state = 'PUBLISH';
      this.searchByID.searchReqObj = searchReqObj;
      this.searchByID.showResults = true;
    }
    else if (this.currentTab === "SEARCH_BY_ATTRS") {
      searchReqObj = this.getItemReqObj();
      searchReqObj.pageNo = 0;
      searchReqObj.pageSize = environment.pageSize;
      searchReqObj.state = 'PUBLISH';
      this.searchByAttrs.searchReqObj = searchReqObj;
      this.searchByAttrs.showResults = true;
    }
  }

  // programatically patch value to item qualifier form
  private qualifierFormSafePatch(value) {
    this.qualiferFormChanged$.unsubscribe();
    this.itemQualifierForm.patchValue(value);
    this.qualiferFormChanged$ = this.itemQualifierForm.valueChanges
      .subscribe(data => this.onItemQualifierFormValueChanged(data));
  }

  // callback called on change of any model values of item type form
  onItemQualifierFormValueChanged(data?: any) {
    let sectorVal = data.sector ? data.sector.value : null;
    let segmentVal = data.segment ? data.segment.value : null;
    let classVal = data.class ? data.class.value : null;
    this.searchFormActive = false;

    if (sectorVal !== null && this.prevSSC.sector !== sectorVal) {
      this.segments = this.getSegments();
      this.classes = [];
      this.qualifierFormSafePatch({ segment: null, class: null });
    }
    else if (segmentVal !== null && this.prevSSC.segment !== segmentVal) {
      this.classes = this.getClasses();
      this.qualifierFormSafePatch({ class: null });
    }
    else if (classVal !== null && this.prevSSC.class !== classVal) {
      this.initSearchForm();
    }

    this.prevSSC = {
      sector: sectorVal,
      segment: segmentVal,
      class: classVal
    };

    this.onSearchValueChange.emit(this.getItemReqObj());
  }

  // callback called on change attribute search data
  onSearchFormValueChanged() {
    if (!this.searchFormActive) { return; }

    let filledInSecondaryAttrs = 0;
    this.searchData.secondaryAttributes.forEach(attr => {
      let attrValue = !Utils.isEmpty(attr.attrValue) && typeof attr.attrValue === "object" ? attr.attrValue.masterAttrValCode : attr.attrValue;
      if (!Utils.isEmpty(attrValue))
        filledInSecondaryAttrs++;
    });

    this.secondaryAttrsFillProportion = filledInSecondaryAttrs + "/" + this.searchData.secondaryAttributes.length;
    this.onSearchValueChange.emit(this.getItemReqObj());
  }

  // callback called when a user switches between search tabs
  onSearchFormTabSelectionChanged(tabName) {
    this.currentTab = tabName;

    if (this.currentTab === "SEARCH_BY_ATTRS") {
      this.searchByAttrs.searchEnabled = this.searchFormActive;
      this.searchByAttrs.resetEnabled = this.searchFormActive;
    }
    else if (this.currentTab === "SEARCH_BY_SKEY") {
      this.searchByID.searchEnabled = (this.itemSkeySearchVal.trim() !== "");
    }
  }

  // called on change of value for search by unique identifier
  onItemSkeySearchValChanged() {
    this.searchByID.searchEnabled = (this.itemSkeySearchVal.trim() !== "");
  }

  onSearchCompleted(searchObj) {
    searchObj.isSearched = true;
  }

}
