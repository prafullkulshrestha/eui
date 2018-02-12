import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

import { ManualMatchingOrganizationsService } from '../../services/manual-matching-organizations.service';
import { Router, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Params } from "@angular/router";
import { Utils } from "app/core/utils";

declare var $;

@Component({
  selector: 'org-manual-matching',
  templateUrl: './org-manual-matching.component.html',
  styleUrls: ['./org-manual-matching.component.css'],
  host: {
    '(document:scroll)': 'onDocumentScroll()'
  }
})
export class OrgManualMatchingComponent implements OnInit {

  @ViewChild("sourceInfoEl") sourceInfoEl : ElementRef;
  
  currentWorkItemSkey: number = null;
  comments: Array<object> = [];
  sourceInfo: any;
  fixedSourceInfoBox: boolean = false;
  externalResources: Array<object> = [];

  constructor(
    private title: Title,
    private router: Router,
    private route: ActivatedRoute,
    private orgService: ManualMatchingOrganizationsService) { }

    private loadWorkflowItem(workItemsSkey) {
      let response = this.orgService.getWorkflowItem(workItemsSkey);
      if(!Utils.isEmpty(response)) {
        this.sourceInfo = {};
        this.sourceInfo.workItemSkey = workItemsSkey;
        this.sourceInfo.orgName = response.orgName;
        this.sourceInfo.orgNum = response.orgNum;
        this.sourceInfo.address = response.address;
        this.sourceInfo.srcSystem = response.srcSystem;
        this.sourceInfo.submittedBy = response.submittedBy;
      }
      else {
        console.log("Could not load workflow item " + workItemsSkey);
        this.router.navigate(["i-don't-care"], { skipLocationChange: true });
      }
    }

  ngOnInit() {
    this.title.setTitle("Org Manual Matching");

    this.route.params
        .subscribe((params: Params) => { 
          this.currentWorkItemSkey = params["workItemsSkey"];
          this.comments = [];
          this.loadWorkflowItem(this.currentWorkItemSkey);
        });

    this.externalResources = [
      {"linkUrl":"http://www.google.com","linkDesc":"Address Search","linkName":"Google"},
      {"linkUrl":"http://www.google.com","linkDesc":"Name Search","linkName":"Google"}
    ]
  }

  // creates a new org master
  createNewMaster() {
    
  }

  // called when document is scrolled
  onDocumentScroll() {
    if($(document).height() - $(window).height() > $(this.sourceInfoEl.nativeElement).height() + 80) {
      this.fixedSourceInfoBox = $(document).scrollTop() >= 80;
    }
  }
}
