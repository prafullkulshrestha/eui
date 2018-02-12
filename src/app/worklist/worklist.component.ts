import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { WorkflowsService } from '../services/workflows.service';
import { Workflows } from "../config/workflow/workflows";
import { ItemsService } from '../services/items.service';
import { ManualMatchingItemsService } from '../services/manual-matching-items.service';
import { ManualMatchingOrganizationsService } from '../services/manual-matching-organizations.service';
import { Title } from '@angular/platform-browser';
import { DataStoreService } from '../services/data-store.service';
import "rxjs/add/operator/switchMap";
import { DatePipe } from '@angular/common';
import { Utils } from '../core/utils';

@Component({
  selector: 'app-worklist',
  templateUrl: './worklist.component.html',
  styleUrls: ['./worklist.component.css']
})
export class WorklistComponent implements OnInit {
  private screenType: string;
  private workflowModelId: string;
  private workflows: Workflows = new Workflows();
  screenData: any;
  constructor(private title: Title, private route: ActivatedRoute, private workflowsService: WorkflowsService,
    private itemsService: ItemsService, private manualMatchingItemsService: ManualMatchingItemsService,
    private manualMatchingOrganizationsService: ManualMatchingOrganizationsService, private router: Router, private dataStoreService: DataStoreService,
    private datePipe: DatePipe) { }

  ngOnInit() {
    this.title.setTitle("Worklist");
    this.route.params
      .switchMap((params: Params) => {
        this.screenType = (params["screenType"]);
        this.workflowModelId = (params["workflowModelId"]);
        return Promise.resolve({ screenType: this.screenType, workflowModelId: this.workflowModelId });
      })
      .subscribe((data) => {
        this.loadDataByScreenType(
          data.workflowModelId, data.screenType);
      });
  }

  loadDataByScreenType(workflowModelId, screenType) {
    this.workflowsService[this.workflows.worklist[workflowModelId][screenType]['workflowServiceMethod']](workflowModelId, screenType)
      .then((response) => {
        let objRefAndStates = response.results;
        let itemPromises = [];
        let itemWorkflowDetail: any = {};
        objRefAndStates.forEach((wfObject) => {
          let serviceName = this.workflows.worklist[wfObject.workflowModelId]['service'];
          let methodName = this.workflows.worklist[wfObject.workflowModelId]['method']
          itemPromises.push(this[serviceName][methodName](wfObject.objectId));
          itemWorkflowDetail[wfObject.objectId] = {
            user: wfObject.user, lastModified: wfObject.lastModified, workflowInstanceId: wfObject.workflowInstanceId,
            workflowModelId: wfObject.workflowModelId, state: wfObject.state
          };
        });
        Promise.all(itemPromises)
          .then((itemResponses) => {
            this.screenData = {
              screenTitle: this.workflows.worklist[workflowModelId][screenType]['title'],
              screenSubTitle: this.workflows.worklist[workflowModelId][screenType]['subTitle'],
              rowColumnsClasses: this.workflows.worklist[workflowModelId]['rowColumnsClasses'],
              worklistData: []
            };
            itemResponses.map((response) => {
              let idColName: string;
              let objectWorkflowModelId: string;
              let objectState: string;
              let idCols = this.workflows.idCols;
              idCols.map((key) => {
                if (response[key]) {
                  idColName = key;
                }
              });
              objectState = itemWorkflowDetail[response[idColName]].state;
              objectWorkflowModelId = itemWorkflowDetail[response[idColName]].workflowModelId;
              response.user = itemWorkflowDetail[response[idColName]].user;
              response.lastModified = Utils.transformDate(itemWorkflowDetail[response[idColName]].lastModified, this.workflows.worklist['dateFormat']);
              response.workflowInstanceId = itemWorkflowDetail[response[idColName]].workflowInstanceId;
              let rowTitleArr: any = this.workflows.worklist[objectWorkflowModelId][objectState]['rowTitle']['columnKeys'];
              let rowTitleVal: string;
              rowTitleArr.forEach(element => {
                if (Utils.isEmpty(rowTitleVal)) {
                  rowTitleVal = response[element];
                }
                else {
                  rowTitleVal = rowTitleVal.concat('\xa0').concat(response[element]);
                }
              });
              response.screenRowTitle = rowTitleVal;
              let showWorkflow = this.workflows.worklist[workflowModelId]['showWorkflow'];
              let rowColumnsTitles = (this.workflows.worklist[objectWorkflowModelId][objectState]['rowColumnsTitles']).slice();
              let rowColumnsKeys = (this.workflows.worklist[objectWorkflowModelId][objectState]['rowColumnsKeys']).slice();
              if (showWorkflow === true) {
                rowColumnsTitles.push(this.workflows.worklist[workflowModelId]['workflowColumnTitle']);
                rowColumnsKeys.push(this.workflows.worklist[workflowModelId]['workflowColumnKey']);
              }
              response.rowColumnsTitles = rowColumnsTitles;
              response.rowColumnsKeys = rowColumnsKeys;
              response.objectWorkflowModelId = objectWorkflowModelId;
              response.objectState = objectState;
              this.screenData.worklistData.push(response);
            });
          }, (error) => {
            console.log("Could not load items", error);
          });

      }, (error) => {
        console.log('Error occurred getting the object refernces for the workflow model id : ' + workflowModelId +
          'for state ' + screenType);
      });
  }

  viewRecord(record) {
    let recordId = record[this.workflows.worklist[record.objectWorkflowModelId][record.objectState]['idCol']];
    if (this.workflows.worklist[this.workflowModelId]['executeAction'] === true) {
      this.workflowsService.getWorkflowHistoryByInstanceId(record.workflowInstanceId)
        .then((response) => {
          this.workflowsService.executeAction(this.workflows.worklist[record.objectWorkflowModelId][record.objectState]['wfAction'],
            'Tier5', record.workflowInstanceId, response);
        }, (error) => {
          console.log('Error occurred getting the history for instance id: ', record.workflowInstanceId);
        });
    }
    let targetUrl: string = this.workflows.worklist[record.objectWorkflowModelId][record.objectState]['detailsUrl'].replace("id", recordId);
    this.router.navigate([targetUrl]);
  }
}
