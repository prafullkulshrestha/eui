import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { WorkflowsService } from '../services/workflows.service';
import { Utils } from '../core/utils';
import { Workflows } from "../config/workflow/workflows";
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser'
@Component({
  selector: 'app-home-dashboard',
  templateUrl: './home-dashboard.component.html',
  styleUrls: ['./home-dashboard.component.css']
})
export class HomeDashboardComponent implements OnInit {
  private workflows: Workflows = new Workflows();
  itemsForApprovalCount: number = 0;
  itemManualMatchingCount: number = 0;
  itemsForDraftCount: number = 0;
  itemsForUserCount: number = 0;
  orgManualMatchingCount: number = 0;
  constructor(
    private title: Title,
    private http: Http,
    private workflowsService: WorkflowsService,
    private router: Router) { }

  ngOnInit() {
    this.title.setTitle("Home Dashboard");
    this.workflowsService.getObjectRefByState(this.workflows.itemManualMatching.wfModel.id,
      this.workflows.itemManualMatching.wfModel.milestones.item_mm_created.id)
      .then((response) => {
        this.itemManualMatchingCount = Utils.formatNumber(response.results.length);
      }, (error) => {
        console.log('Error occurred getting the object refernces for the workflow model id : ' + this.workflows.itemManualMatching.wfModel.id +
          'for state ' + this.workflows.itemManualMatching.wfModel.milestones.item_mm_created.id);
      });
    this.workflowsService.getObjectRefByState(this.workflows.itemCreation.wfModel.id,
      this.workflows.itemCreation.wfModel.milestones.item_cr_draft.id)
      .then((response) => {
        this.itemsForDraftCount = Utils.formatNumber(response.results.length);
      }, (error) => {
        console.log('Error occurred getting the object refernces for the workflow model id : ' + this.workflows.itemCreation.wfModel.id +
          'for state ' + this.workflows.itemCreation.wfModel.milestones.item_cr_draft.id);
      });
    this.workflowsService.getObjectRefByState(this.workflows.itemCreation.wfModel.id,
      this.workflows.itemCreation.wfModel.milestones.item_cr_review.id)
      .then((response) => {
        this.itemsForApprovalCount = Utils.formatNumber(response.results.length);
      }, (error) => {
        console.log('Error occurred getting the object refernces for the workflow model id : ' + this.workflows.itemCreation.wfModel.id +
          'for state ' + this.workflows.itemCreation.wfModel.milestones.item_cr_review.id);
      });
     this.workflowsService.getObjectRefByState(this.workflows.orgManualMatching.wfModel.id,
      this.workflows.orgManualMatching.wfModel.milestones.org_mm_created.id)
      .then((response) => {
        this.orgManualMatchingCount = Utils.formatNumber(response.results.length);
      }, (error) => {
        console.log('Error occurred getting the object refernces for the workflow model id : ' + this.workflows.orgManualMatching.wfModel.id +
          'for state ' + this.workflows.orgManualMatching.wfModel.milestones.org_mm_created.id);
      });
    this.workflowsService.getObjectRefAssigned()
      .then((response) => {
        this.itemsForUserCount = Utils.formatNumber(response.results.length);
      }, (error) => {
        console.log('Error occurred getting the object refernces for the logged in user');
      });
  }

  // View the worklist screen
  onView(workflowModelId, screenType) {
    this.router.navigate(['worklist/' + workflowModelId + '/' + screenType]);
  }
}
