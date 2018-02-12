import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Output, EventEmitter, OnChanges, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { FileUploader } from "ng2-file-upload";

import { EmdmModal } from "../core/components/emdm-modal.component";
import { EmdmCollapsiblePanel } from "../core/components/emdm-collapsible-panel.component";

import { ItemsAttributeService } from '../services/items-attribute.service';
import { ItemsService } from '../services/items.service';
import { ManualMatchingItemsService } from '../services/manual-matching-items.service';
import { WorkflowsService } from '../services/workflows.service';
import { EmdmUtilService } from '../services/emdm-util.service';
import { MessageService } from "app/services/message.service";

import { requiredTrimmedValidator } from '../core/validators/required-trimmed.validator';
import { DateRangeValidator } from '../core/validators/effective-dates-range.validator';
import { requiredPositiveValidator } from '../core/validators/required-positive.validator';
import { validateAttributeChoice } from '../core/validators/validate-attribute-choice.validator';
import { Utils } from "../core/utils";
import { Common } from "../common";
import { Workflows } from "../config/workflow/workflows";

declare var $: any;
const URL = 'http://vl183.msais.com:8228/api/items/uploadImage/';

@Component({
  selector: 'item-form',
  templateUrl: './item-form.component.html',
  styleUrls: ['./item-form.component.css']
})
export class ItemFormComponent implements OnInit, OnChanges {

  private prevSSC: any = { sector: null, segment: null, class: null };
  private workflows: Workflows = new Workflows();
  private isValidUPC: boolean = false;
  private qualiferFormChanged$: any;
  private FAILED_UPC_STANDARDIZATION = "failed UPC standardization";

  @ViewChild("secondaryAttrsPanel") secondaryAttrsPanel: EmdmCollapsiblePanel;
  @ViewChild("componentItemsPanel") componentItemsPanel: EmdmCollapsiblePanel;

  @ViewChild('invalidImageFileExtModal') invalidImageFileExtModal: EmdmModal;
  @ViewChild('deleteDraftModal') deleteDraftModal: EmdmModal;
  @ViewChild('deleteDraftStatusModal') deleteDraftStatusModal: EmdmModal;
  @ViewChild('serverValidationModal') serverValidationModal: EmdmModal;
  @ViewChild('confirmPublishModal') confirmPublishModal: EmdmModal;

  @Input("item") inputItem: any;
  @Input() mode: string;
  @Input() workflowItem: any;
  @Output() onItemFormChange: EventEmitter<any> = new EventEmitter();

  sectors = [];
  segments = [];
  classes = [];

  item = {
    itemSkey: null,
    typeToggle: {
      value: 'individual',
      disabled: false
    },
    imageUrl: null,
    primaryAttributes: [],
    secondaryAttributes: [],
    comments: [],
    state: null
  };

  // details for component items for a combo item master
  component = {
    items: [],
    initialItems: [],
    reqObj: null,
    latestReqObj: null,
    disableOptions: {
      sector: false,
      segment: false,
      class: false
    },
    viewOptions: {
      canLinkToRecord: true
    },
    showModal: false
  }

  initialAttributes: any;

  itemSaveForm: FormGroup;
  itemQualifierForm: FormGroup;
  saveFormActive: boolean = false;
  qualifierFormActive: boolean = false;
  serverValidationErrors: any[] = [];

  secondaryAttrsFillProportion: string = "";
  imageFileName: string;
  uploader: FileUploader = new FileUploader({ url: URL });

  editingShortDesc: boolean = false;
  shortDesc: string = '';
  shortDescByAttr: string = null;

  deleteDraftMsg: any;
  invalidImageFileExtMsg: any;
  isPublishable: boolean = false;
  effStartDateDefault = new Date('1900-01-01');
  effEndDateDefault = new Date('2999-12-31');

  // holds ref to all controls of item save form
  formErrors: any;

  // holds all validation error msgs for item save form
  validationMessages = {
    'upc': {
      'requiredTrimmed': 'UPC is required.',
      'minlength': 'UPC must be 14 digits long.',
      'maxlength': 'UPC must be 14 digits long.',
      'pattern': 'UPC must contain only digits'
    },
    'primaryAttributesFormArray': [],
    'secondaryAttributesFormArray': [],
    'effectiveStartDate': {
      'required': 'Invalid date format',
      'outsideRange': 'End date must be greater than the start date'
    },
    'effectiveEndDate': {
      'required': 'Invalid date format',
      'outsideRange': 'End date must be greater than the start date'
    }
  };

  constructor(private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private itemsAttributeService: ItemsAttributeService,
    private itemsService: ItemsService,
    private manualMatchingItemsService: ManualMatchingItemsService,
    private emdmUtilService: EmdmUtilService,
    private workflowsService: WorkflowsService,
    private messageService: MessageService
  ) {
    this.createItemQualifierForm();
    this.createItemSaveForm();
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
  private createItemSaveForm() {
    this.itemSaveForm = this.fb.group({
      upc: ['', [requiredTrimmedValidator(), Validators.pattern("[0-9]+"), Validators.minLength(14), Validators.maxLength(14)]],
      primaryAttributesFormArray: this.fb.array([]),
      secondaryAttributesFormArray: this.fb.array([]),
      effectiveStartDate: [new Date(this.effStartDateDefault), Validators.required],
      effectiveEndDate: [new Date(this.effEndDateDefault), Validators.required]
    }, {
        validator: DateRangeValidator.datesRangeValidator
      });

    if (this.itemSaveForm) {
      this.itemSaveForm.valueChanges
        .subscribe(data => this.onItemSaveFormValueChanged(data));
    }
  }

  // programatically patch value to item qualifier form
  private qualifierFormSafePatch(value) {
    this.qualiferFormChanged$.unsubscribe();
    this.itemQualifierForm.patchValue(value);
    this.qualiferFormChanged$ = this.itemQualifierForm.valueChanges
      .subscribe(data => this.onItemQualifierFormValueChanged(data));
  }

  // setup primary and secondary attributes form array. adds necessary validators to primary attributes.
  private setAttrsFormArray(attrsType, attrs): FormArray {
    let attrFormArray = [];

    for (var i = 0; i < attrs.length; i++) {
      let attr = attrs[i];

      // set validators
      let validators = [];
      let controlName = "";
      if (attrsType === "PRIMARY") {
        if (attr.fieldType === "TEXT") { // primary TEXT attr value is mandatory
          validators.push(requiredTrimmedValidator());
        }
        else if (attr.fieldType === "COMBO") { // value must be selected for primary COMBO attrs
          validators.push(validateAttributeChoice());
        }
        else if (attr.fieldType === "number") { // primary number attr must have a value greater than 0
          validators.push(requiredTrimmedValidator());
        }
      }

      if (attr.fieldType === "TEXT") { // any TEXT attribute can only be 100 chars long
        validators.push(Validators.maxLength(100));
      } else if (attr.fieldType === "number") { // number fields must be greater than 0.
        validators.push(requiredPositiveValidator());
      }

      // add control to from array
      attrFormArray.push(this.fb.control('', validators));

      // set validation error messages
      this.validationMessages[attrsType.toLowerCase() + "AttributesFormArray"][i] = {
        attributeChoice: attr.masterAttrDisplayName + " is required.",
        requiredTrimmed: attr.masterAttrDisplayName + " is required.",
        maxlength: attr.masterAttrDisplayName + " cannot have more than 100 characters.",
        requiredPositive: attr.masterAttrDisplayName + " must be a number greater than 0."
      };
    }

    return this.fb.array(attrFormArray);
  }

  private initItemSaveForm() {
    let qFormValue = this.itemQualifierForm.value;
    if (Utils.isEmpty(qFormValue.sector.value) || Utils.isEmpty(qFormValue.segment.value)
      || Utils.isEmpty(qFormValue.class.value))
      return;

    // load attribute form
    setTimeout(() => {
      this.resetOtherFields();
      
      this.itemsAttributeService
        .getAttributes({
          industrySector: qFormValue.sector.value,
          industrySegment: qFormValue.segment.value,
          industryClass: qFormValue.class.value
        })
        .then((attrs) => {
          let attributes = attrs.slice().map((attr) => Utils.deepCopy(attr));
          this.item.primaryAttributes = Common.getOrderedAttrList(attributes, "PRIMARY").slice().map(t => Utils.deepCopy(t));
          this.item.secondaryAttributes = Common.getOrderedAttrList(attributes, "SECONDARY").slice().map(t => Utils.deepCopy(t));

          if (!Utils.isEmpty(this.inputItem))
            Common.setAttrValuesForItem({
              primaryAttributes: this.item.primaryAttributes,
              secondaryAttributes: this.item.secondaryAttributes
            }, this.inputItem.attributes);

          setTimeout(() => {
            this.initialAttributes = Utils.deepCopy(this.getAttrsReqObj(false));
          });

          this.itemSaveForm.setControl("primaryAttributesFormArray",
            this.setAttrsFormArray("PRIMARY", this.item.primaryAttributes));
          this.itemSaveForm.setControl("secondaryAttributesFormArray",
            this.setAttrsFormArray("SECONDARY", this.item.secondaryAttributes));

          this.onItemFormChange.emit({
            ...this.getItemReqObj(false),
            totalPrimary: this.item.primaryAttributes.length,
            totalSecondary: this.item.secondaryAttributes.length
          });
          this.saveFormActive = true;
        });
    });
  }

  // get request object for an item
  private getItemReqObj(withoutPrimarySecondary: boolean) {
    let qFormValue = this.itemQualifierForm.value;
    let saveFormValue = this.itemSaveForm.value;

    return {
      upc: this.isValidUPC && saveFormValue ? saveFormValue.upc : "",
      industrySector: !Utils.isEmpty(qFormValue.sector) ? qFormValue.sector.value : null,
      industrySegment: !Utils.isEmpty(qFormValue.segment) ? qFormValue.segment.value : null,
      industryClass: !Utils.isEmpty(qFormValue.class) ? qFormValue.class.value : null,
      ...this.getAttrsReqObj(withoutPrimarySecondary)
    };
  }

  // get request object for attribute set to be used for search
  private getAttrsReqObj(withoutPrimarySecondary) {
    let primaryAttributes = [];
    let secondaryAttributes = [];

    if (this.saveFormActive) {
      let searchFormValues: any = this.itemSaveForm.value;
      primaryAttributes = Common.buildAttrsReqObj(this.item.primaryAttributes, searchFormValues.primaryAttributesFormArray);
      secondaryAttributes = Common.buildAttrsReqObj(this.item.secondaryAttributes, searchFormValues.secondaryAttributesFormArray);
    }

    if (withoutPrimarySecondary)
      return {
        attributes: primaryAttributes.concat(secondaryAttributes)
      }
    else
      return {
        primaryAttributes,
        secondaryAttributes,
        attributes: primaryAttributes.concat(secondaryAttributes)
      }
  }

  // prepares request object to be saved as an item master
  private buildRequestObj(state) {
    let saveFormValues: any = this.itemSaveForm.value;
    let reqObj: any = this.getItemReqObj(true);

    reqObj.shortDescription = this.editingShortDesc ? this.shortDesc : this.shortDescByAttr;
    reqObj.longDescription = Common.getItemDesc(this.item.primaryAttributes, this.item.secondaryAttributes, 'long');
    reqObj.status = "ACTIVE";
    reqObj.itemType = this.item.typeToggle.value;
    reqObj.componentItems = this.item.typeToggle.value === 'combo' ?
      this.component.items.map((item) => {
        return { itemSkey: item.itemSkey, quantity: item.quantity }
      }) : null;

    if (!Utils.isEmpty(this.item.itemSkey)) {
      reqObj.itemSkey = this.item.itemSkey;
      reqObj.reasonForChange = "Modified";
    } else {
      reqObj.reasonForChange = "Newly Created";
    }

    reqObj.stdInd = state === "DRAFT" ? "N" : "Y";
    if (this.item.comments.length > 0) {
      reqObj.comments = this.item.comments;
      let isUpcNotStandard = reqObj.comments.filter((comment) => comment.text.indexOf(this.FAILED_UPC_STANDARDIZATION) >= 0).length > 0;
      reqObj.stdInd = isUpcNotStandard ? 'N' : 'Y';
    }
    reqObj.effStartDt = !Utils.isEmpty(saveFormValues.effectiveStartDate) ? Utils.transformDate(saveFormValues.effectiveStartDate, "yyyy-MM-dd") : "1900-01-01";
    reqObj.effEndDt = !Utils.isEmpty(saveFormValues.effectiveEndDate) ? Utils.transformDate(saveFormValues.effectiveEndDate, "yyyy-MM-dd") : "2999-12-31";
    return reqObj;
  }

  private performManualMatchWorkflowAction(itemState) {
    if (itemState == 'PUBLISH') {
      if (!Utils.isEmpty(this.workflowItem)) {
        let wSkey = this.workflowItem.workItemSkey;
        let wfModelId = this.workflows.itemManualMatching.wfModel.id;

        this.manualMatchingItemsService.matchWorkflowItem({
          workItemSkey: wSkey,
          itemMasterSkey: this.item.itemSkey,
          entItemUnivId: this.workflowItem.entItemUnivId
        })
        .then((response) => {
          if (response.status === "success") {
            // Update the workflow also
            this.workflowsService.executeWorkflowAction("Match", "Tier5", wfModelId, wSkey)
              .then(() => {
                alert("Workflow item " + wSkey + " matched with master item " + this.item.itemSkey);
                this.navigateToDashboard();          
              });
          }
          else
            alert("Failed matching workflow item " + wSkey + " to master item " + this.item.itemSkey);
        }, () => {
          alert("Some error occured while matching workflow item " + wSkey);
        });
      }
      else {
        this.manualMatchingItemsService.matchIfApplicable(this.item.itemSkey)
          .then((response) => {
            alert(response.message);
            this.navigateToDashboard();
          }, (error) => {
            this.navigateToDashboard();
          });
      }
    }
    else if (itemState == 'DRAFT') {
      if (!Utils.isEmpty(this.workflowItem)) {
        this.manualMatchingItemsService.matchWorkflowItemToDraft({
          workItemSkey: this.workflowItem.workItemSkey,
          itemMasterSkey: this.item.itemSkey
        })
          .then(() => {
            alert("Workflow item " + this.workflowItem.workItemSkey + " matched with master item " + this.item.itemSkey);
          }, (error) => {
            console.log(error);
            alert("Some error occured while matching workflow item " + this.workflowItem.workItemSkey);
          });
      }
    }
  }

  // calls the api to save/publish an item master
  private postSaveRequest(reqObj) {
    this.itemsService
      .saveItem(reqObj)
      .then((response) => {
        this.item.itemSkey = response["itemSkey"];
        alert('Item has been saved with key: ' + this.item.itemSkey);
        // Call the workflow to check whether the workflow instance is already there for this item
        let objectReference: any = {
          'workflowModelId': this.workflows.itemCreation.wfModel.id,
          'objectId': this.item.itemSkey
        };
        this.workflowsService.getWorkflowInstanceIdByObjectReference(objectReference)
          .then((response) => {
            let workflowInstanceId = response["workflowInstanceId"];
            this.workflowsService.getWorkflowHistoryByInstanceId(workflowInstanceId)
              .then((response) => {
                let action = 'Save';
                if (reqObj.state == 'PUBLISH') {
                  action = 'Publish';
                }
                this.workflowsService.executeAction(action, "Tier4", workflowInstanceId, response)
                  .then(() => { this.performManualMatchWorkflowAction(reqObj.state) });
              }, (error) => {
                console.log('Error occurred getting the history for instance id: ', workflowInstanceId);
              });


          }, (error) => {
            //Create the workflow instance for this item skey
            let createworkflowInstancePostBody = this.workflows.createWorkflowInstancePostBody;
            createworkflowInstancePostBody.objectId = objectReference.objectId;
            this.workflowsService.createWorkflowInstance(objectReference.workflowModelId,
              createworkflowInstancePostBody)
              .then((response) => {
                let workflowInstanceId = response["instanceId"];
                console.log('Workflow instance created with id: ', workflowInstanceId);
                let action = 'Save';
                if (reqObj.state == 'PUBLISH') {
                  action = 'Publish';
                }
                this.workflowsService.executeAction(action, "Tier4", workflowInstanceId, response)
                  .then(() => { this.performManualMatchWorkflowAction(reqObj.state) });
              }, (error) => {
                console.log('Error occurred while creating the workflow instance for the item id ', objectReference.workflowModelId)
              });

          });
        this.item.state = response.state;
        // Call the image upload function from post save request to save the image
        if (this.item.imageUrl) {
          this.uploader.queue[0].url = URL + this.item.itemSkey;
          this.uploadMasterImage();
        }
      }, (error) => {
        let serverError = error.json();
        if (serverError.fieldErrors) {
          this.serverValidationErrors = serverError.fieldErrors;
          this.serverValidationModal.show();
        }
        else {
          alert("Some Error Occured");
        }
      });
  }

  private attrValueMap = (obj, fieldType) => {
    if (Utils.isEmpty(obj) || fieldType !== "COMBO")
      return obj;
    else
      return {
        masterAttrValCode: obj.attrCode,
        masterAttrValLongName: obj.attrLongName,
        masterAttrValShortName: obj.attrShortName,
        classAttrValSkey: obj.classAttrValSkey
      }
  }

  private sscMap = value => ({ text: value, value: value });

  private comboItemMap = (item, quantity) => {
    return {
      itemSkey: item.itemSkey,
      description: item.shortDescription,
      upc: item.upc,
      quantity: quantity
    }
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

  // Validate function to validate the upload image extension
  private isValidFileExtension(event) {
    var _validFileExtensions = [".jpg", ".jpeg", ".bmp", ".gif", ".png"];
    var sFileName = event.target.value;
    if (sFileName.length > 0) {
      let isValidExtension = false;
      for (var j = 0; j < _validFileExtensions.length; j++) {
        var sCurExtension = _validFileExtensions[j];
        if (sFileName.substr(sFileName.length - sCurExtension.length, sCurExtension.length).toLowerCase() == sCurExtension.toLowerCase()) {
          isValidExtension = true;
          break;
        }
      }
      if (!isValidExtension) {
        this.invalidImageFileExtModal.show();
        this.invalidImageFileExtMsg = "Sorry, " + sFileName + " is invalid, allowed extensions are: " + _validFileExtensions.join(", ");
        return false;
      }
    }

    return true;
  }

  private resetOtherFields() {
    let effStartDate = !Utils.isEmpty(this.inputItem) && !Utils.isEmpty(this.inputItem.effStartDt) ? 
        new Date(this.inputItem.effStartDt) : new Date(this.effStartDateDefault);
    let effEndDate = !Utils.isEmpty(this.inputItem) && !Utils.isEmpty(this.inputItem.effEndDt) ? 
        new Date(this.inputItem.effEndDt) : new Date(this.effEndDateDefault);
        
    this.itemSaveForm.patchValue({
      upc: this.inputItem && this.inputItem.upc || '',
      effectiveStartDate: new Date(effStartDate),
      effectiveEndDate: new Date(effEndDate)
    });
    this.itemSaveForm.controls['upc'].markAsPristine();

    this.item.itemSkey = this.inputItem && this.inputItem.itemSkey || this.item.itemSkey;
    this.item.typeToggle.value = this.inputItem && this.inputItem.itemType || this.item.typeToggle.value;
    this.item.state = this.inputItem && this.inputItem.state || this.item.state;
    this.component.items = this.component.initialItems.slice() || [];
    this.item.comments = this.inputItem && this.inputItem.comments && this.inputItem.comments.slice() || [];
    this.shortDesc = this.inputItem && this.inputItem.shortDescription || this.shortDesc;

    this.formErrors = {
      'upc': '',
      'primaryAttributesFormArray': [],
      'secondaryAttributesFormArray': [],
      'effectiveStartDate': '',
      'effectiveEndDate': ''
    }
    // TODO: add image url later
  }

  ngOnInit() {
    this.messageService.onComboItemLink$.subscribe((item) => this.onComboItemLink(item));
  }

  ngOnChanges() {
    let sscPromise = this.itemsAttributeService.loadSectorSegmentClass();
    
    if (Utils.isEmpty(this.inputItem)) { // new item
      sscPromise.then(() => {
        this.sectors = this.getSectors();
        this.qualifierFormActive = true;
      });
    }
    else { // has initial values
      sscPromise.then(() => {
        this.sectors = this.getSectors();

        if (!Utils.isEmpty(this.inputItem.industrySector)) {
          this.qualifierFormSafePatch({ sector: this.sscMap(this.inputItem.industrySector) });
          this.prevSSC.sector = this.inputItem.industrySector;
          this.segments = this.getSegments();
        }

        if (!Utils.isEmpty(this.inputItem.industrySegment)) {
          this.qualifierFormSafePatch({ segment: this.sscMap(this.inputItem.industrySegment) });
          this.prevSSC.segment = this.inputItem.industrySegment;
          this.classes = this.getClasses();
        }

        if (!Utils.isEmpty(this.inputItem.industryClass)) {
          this.qualifierFormSafePatch({ class: this.sscMap(this.inputItem.industryClass) });
          this.prevSSC.class = this.inputItem.industryClass;
        }

        this.qualifierFormActive = true;               
        let effStartDate = !Utils.isEmpty(this.inputItem.effStartDt) ? new Date(this.inputItem.effStartDt) : new Date(this.effStartDateDefault);
        let effEndDate = !Utils.isEmpty(this.inputItem.effEndDt) ? new Date(this.inputItem.effEndDt) : new Date(this.effEndDateDefault);
        this.itemSaveForm.patchValue({ upc: this.inputItem.upc || '' });
        this.itemSaveForm.patchValue({ effectiveStartDate: effStartDate });
        this.itemSaveForm.patchValue({ effectiveEndDate: effEndDate });
        this.resetOtherFields();

        let componentItemPromises = (this.inputItem.componentItems || [])
          .map((item) => this.itemsService.getItemMaster(item.itemSkey));

        Promise.all(componentItemPromises)
          .then((itemResponses) => {
            this.component.items = [];
            for (let i = 0; i < itemResponses.length; i++) {
              this.component.items.push(this.comboItemMap(itemResponses[i], this.inputItem.componentItems[i].quantity));
            }
            this.component.initialItems = this.component.items.slice();
          });

        this.initItemSaveForm();
      });
    }
  }

  // callback called on change of any model values of item type form
  onItemQualifierFormValueChanged(data?: any) {
    this.item.imageUrl = null;
    let sectorVal = data.sector ? data.sector.value : null;
    let segmentVal = data.segment ? data.segment.value : null;
    let classVal = data.class ? data.class.value : null;
    this.inputItem = null;
    this.saveFormActive = false;

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
      this.initItemSaveForm();
    }

    if (sectorVal === 'COMBO' || segmentVal === 'COMBO' || classVal === 'COMBO') {
      this.item.typeToggle.value = 'combo';
      this.item.typeToggle.disabled = true;
    }
    else if (sectorVal !== 'COMBO' && segmentVal !== 'COMBO' && classVal !== 'COMBO') {
      this.item.typeToggle.value = 'individual';
      this.item.typeToggle.disabled = false;
    }

    this.prevSSC = {
      sector: sectorVal,
      segment: segmentVal,
      class: classVal
    };

    this.onItemFormChange.emit({
      ...this.getItemReqObj(false),
      totalPrimary: this.item.primaryAttributes.length,
      totalSecondary: this.item.secondaryAttributes.length
    });
  }

  // callback called on change of any model values of item save form
  onItemSaveFormValueChanged(data?: any) {
    if (!this.itemSaveForm) { return; }

    this.setItemShortDesc();
    let totalPrimaryAttrs = 0, filledInPrimaryAttrs = 0, filledInSecondaryAttrs = 0;
    this.isValidUPC = true;
    for (const field in this.formErrors) {
      if (typeof this.formErrors[field] === "string") { // a single control
        totalPrimaryAttrs++;
        this.formErrors[field] = '';
        const control = this.itemSaveForm.get(field);

        if (control && control.dirty && control.invalid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            this.formErrors[field] = messages[key];
            if (field === "upc")
              this.isValidUPC = false;
            break;
          }
        }
        else {
          if (control && control.valid)
            filledInPrimaryAttrs++;
        }
      }
      else if (typeof this.formErrors[field] === "object") { // control array
        const controls = this.itemSaveForm.controls[field]["controls"];
        if (field === "primaryAttributesFormArray") totalPrimaryAttrs += controls.length;

        for (var i = 0; i < controls.length; i++) {
          var control: FormControl = controls[i];
          this.formErrors[field][i] = control && control.invalid ? this.formErrors[field][i] || '' : '';
          this.cdr.detectChanges();

          if (control && control.dirty && control.invalid) {
            const messages = this.validationMessages[field] ? this.validationMessages[field][i] : "";

            for (const key in control.errors) {
              this.formErrors[field][i] = messages[key];
              this.cdr.detectChanges();
              break;
            }
          }
          else {
            if (field === "primaryAttributesFormArray" && control && control.valid)
              filledInPrimaryAttrs++;
            else if (field === "secondaryAttributesFormArray") {
              let attrValue = !Utils.isEmpty(control.value) && typeof control.value === "object" ? control.value.masterAttrValCode : control.value;
              if (!Utils.isEmpty(attrValue))
                filledInSecondaryAttrs++;
            }
          }

          control.markAsPristine();
        }
      }
    }
    this.isPublishable = filledInPrimaryAttrs === totalPrimaryAttrs;
    this.secondaryAttrsFillProportion = filledInSecondaryAttrs + "/" + this.item.secondaryAttributes.length;

    this.onItemFormChange.emit({
      ...this.getItemReqObj(false),
      totalPrimary: this.item.primaryAttributes.length,
      totalSecondary: this.item.secondaryAttributes.length
    });
  }

  // resets this component
  resetToInitialForm() {
    this.resetItemSaveForm();
    this.resetOtherFields();
  }

  // resets item save form. sets all fields to its initial/default values
  resetItemSaveForm() {
    let pValues = [], sValues = [];
    let pAttrs = this.item.primaryAttributes, sAttrs = this.item.secondaryAttributes;

    for (var i = 0; i < pAttrs.length; i++) {
      let foundAttr = this.initialAttributes.primaryAttributes
        .filter((attr) => attr.attrName === pAttrs[i].masterAttrName)[0];
      let attrValue = null;

      if (!Utils.isEmpty(foundAttr))
        attrValue = foundAttr.attrValue;
      else {
        if (pAttrs[i].fieldType === "COMBO")
          attrValue = null;
        else
          attrValue = "";
      }
      pValues.push(this.attrValueMap(attrValue, pAttrs[i].fieldType));
    }

    for (var i = 0; i < sAttrs.length; i++) {
      let foundAttr = this.initialAttributes.secondaryAttributes
        .filter((attr) => attr.attrName === sAttrs[i].masterAttrName)[0];
      let attrValue = null;

      if (!Utils.isEmpty(foundAttr))
        attrValue = foundAttr.attrValue;
      else {
        if (sAttrs[i].fieldType === "COMBO")
          attrValue = null;
        else
          attrValue = "";
      }
      sValues.push(this.attrValueMap(attrValue, sAttrs[i].fieldType));
    }

    this.itemSaveForm.setValue({
      upc: this.inputItem && this.inputItem.upc || '',
      effectiveStartDate: this.inputItem && new Date(this.inputItem.effStartDt) || '',
      effectiveEndDate: this.inputItem && new Date(this.inputItem.effEndDt) || '',
      primaryAttributesFormArray: pValues,
      secondaryAttributesFormArray: sValues
    });
  }

  // show/hide manual edit textbox for short description
  showEditDesc(flag) {
    this.editingShortDesc = flag;
    if (flag && !this.shortDesc) {
      this.shortDesc = this.shortDescByAttr;
    } else if (!flag && this.shortDesc === this.shortDescByAttr) {
      this.shortDesc = "";
    }
  }

  // set item short description
  setItemShortDesc() {
    if (this.editingShortDesc) return;

    this.shortDescByAttr = Common.getItemDesc(this.item.primaryAttributes, this.item.secondaryAttributes, 'short');
    this.cdr.detectChanges();
  }

  // handle uploaded file
  onSelectFile(event) {
    if (this.isValidFileExtension(event)) {
      if (event.target.files && event.target.files[0]) {
        var reader = new FileReader();

        reader.onload = (event: any) => {
          this.item.imageUrl = event.target['result'];
        };
        this.imageFileName = event.target.files[0]['name'];
        reader.readAsDataURL(event.target.files[0]);
      }
    }
    event.target.value = '';
  }

  // upload iteam master image
  uploadMasterImage() {
    this.uploader.onBeforeUploadItem = (item) => {
      item.withCredentials = false
    }
    if (this.uploader.queue.length) {
      this.uploader.queue[0].upload();
    }
  }

  // saves a draft of item master
  onSave(isCommit: boolean) {
    let state: string = "";
    if (isCommit)
      state = "PUBLISH";
    else
      state = "DRAFT";

    let reqObj = this.buildRequestObj(state);
    reqObj.state = state;

    this.postSaveRequest(reqObj);
  }

  // pulishes an item master
  onCommit() {
    this.onItemSaveFormValueChanged(this.itemSaveForm.value);
    let secondaryAttrsValid = this.formErrors.secondaryAttributesFormArray.filter((t) => { return !Utils.isEmpty(t) }).length === 0;
    let comboLinkedItemsValid = true;

    if (this.item.typeToggle.value === 'combo') {
      for (let i = 0; i < this.component.items.length; i++) {
        if (isNaN(this.component.items[i].quantity) || this.component.items[i].quantity <= 0) {
          comboLinkedItemsValid = false;
          break;
        }
      }
    }

    if (!comboLinkedItemsValid)
      this.componentItemsPanel.collapsed = false;

    if (!secondaryAttrsValid)
      this.secondaryAttrsPanel.collapsed = false;

    if (!this.itemSaveForm.valid || !secondaryAttrsValid ||
      (this.item.typeToggle.value === 'combo' && !comboLinkedItemsValid))
      return;

    //Check whether user is allowed to publish
    this.emdmUtilService
      .checkUPCValidity(this.itemSaveForm.value.upc)
      .then((response) => {
        if (response.validGTIN) {
          this.itemSaveForm.patchValue({ upc: response.standardizedUPC });
          this.onSave(true);
        }
        else {
          this.confirmPublishModal.show();
        }
      });

  }

  // called when user agrees to publisg item with non-standardized UPC
  onConfirmPublish() {
    let user = JSON.parse(localStorage['id']);
    this.item.comments.unshift({
      email: user.email,
      text: this.FAILED_UPC_STANDARDIZATION,
      createdDate: Utils.getDateTime()
    });
    this.onSave(true);
  }

  // show delete draft confirmation dialog
  confirmDeleteDraft(flag) {
    this.deleteDraftModal.show();
  }

  // deletes a draft item
  deleteItemDraft() {
    this.itemsService
      .deleteDraft(this.item.itemSkey)
      .then((res) => {
        this.deleteDraftModal.hide();

        // in case the current draft was matched, unlink from the workflow item
        this.manualMatchingItemsService.unlinkMatchedDraft(this.item.itemSkey)
          .then(() => { console.log("Item unlinked"); },
          (error) => { console.log("Unmatched draft", error); });

        // Update the workflow also
        this.workflowsService.executeWorkflowAction("Delete_Draft", "Tier4",
          this.workflows.itemCreation.wfModel.id, this.item.itemSkey)
          .then(() => {
            this.deleteDraftMsg = res["_body"];
            this.deleteDraftStatusModal.show();
          });
      }, (error) => {
        this.deleteDraftMsg = error["_body"];
        this.deleteDraftModal.hide();
        this.deleteDraftStatusModal.show();
      });
  }

  navigateToDashboard() {
    this.router.navigate(["home-dashboard"]);
  }

  // launch modal to find component items
  findComonentItems(event) {
    event.stopPropagation();
    event.preventDefault();
    let formReqObj = this.getItemReqObj(false);

    this.component.reqObj = !Utils.isEmpty(this.component.latestReqObj) ? this.component.latestReqObj : formReqObj;
    this.component.disableOptions.sector = formReqObj.industrySector !== "COMBO";
    this.component.disableOptions.segment = formReqObj.industrySegment !== "COMBO";
    this.component.disableOptions.class = formReqObj.industryClass !== "COMBO";
    this.component.showModal = true;
    $("#searchComponentItemModal").modal('show');
  }

  // called when an item needs to be linked to a combo
  onComboItemLink(item) {
    let existingItems = this.component.items.filter((t) => t.itemSkey === item.itemSkey);
    if (existingItems.length === 0) {
      this.component.items.push(this.comboItemMap(item, 1));
      $("#searchComponentItemModal").modal('hide');
    }
    else {
      alert("This item is already linked.");
    }
  }

  onComboSearchValueChanged($event) {
    this.component.latestReqObj = $event;
  }

}
