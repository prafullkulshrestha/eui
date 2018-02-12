import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import { Workflows } from "../config/workflow/workflows";
import { HttpClientService } from './http-client.service';
import { ItemsService } from '../services/items.service';
@Injectable()
export class WorkflowsService {
    private workflows: Workflows = new Workflows();
    private worklistData: string;
    constructor(private httpClient: HttpClientService,
        private itemsService: ItemsService) { }

    createWorkflow(data) {
        return this.httpClient
            .post("/api/workflows/createWorkflow", data)
            .then((response: Response) => {
                return response.json();
            });
    }

    createWorkflowInstance(workflowModelId, data) {
        return this.httpClient
            .post("/api/workflows/createWorkflowInstance/" + workflowModelId, data)
            .then((response: Response) => {
                return response.json();
            });
    }

    isUserAllowedAction(workflowId, data) {
        return this.httpClient
            .post("/api/workflows/isUserAllowedAction/" + workflowId, data)
            .then((response: Response) => {
                return response.json();
            });
    }

    getAllowedAction(workflowId, data) {
        return this.httpClient
            .post("/api/workflows/getAllowedAction/" + workflowId, data)
            .then((response: Response) => {
                return response.json();
            });
    }

    doAction(workflowId, data) {
        return this.httpClient
            .post("/api/workflows/doAction/" + workflowId, data)
            .then((response: Response) => {
                return response.json();
            });
    }

    getWorkflowInstanceIdByObjectReference(objectReference) {
        return this.httpClient
            .get("/api/workflows/getWorkflowInstanceIdByObjectRef/" + objectReference.workflowModelId + "/" + objectReference.objectId)
            .then((response: Response) => {
                return response.json();
            });
    }

    getWorkflowHistoryByInstanceId(workflowInstanceId) {
        return this.httpClient
            .get("/api/workflows/getHistory/" + workflowInstanceId)
            .then((response: Response) => {
                return response.json();
            });
    }

    getObjectRefByState(workflowModelId, state) {
        return this.httpClient
            .get("/api/workflows/getObjectRefByState/" + workflowModelId + "/" + state)
            .then((response: Response) => {
                return response.json();
            });

    }



    getObjectRefAssigned() {
        let token = localStorage['id'];
        let user = JSON.parse(token).email;
        let milestones = this.workflows.homeDashboard.myWorklist.milestones;
        let postBody: any = {
            username: user,
            milestones: milestones
        };
        return this.httpClient
            .post("/api/workflows/getObjectRefForUser/", postBody)
            .then((response: Response) => {
                return response.json();
            });
    }

    getObjectRefForUser(workflowModelId, state) {
        return this.getObjectRefAssigned();
    }

    executeWorkflowAction(action, role, workflowModelId, objectId) {
        let objectReference: any = {
            'workflowModelId': workflowModelId,
            'objectId': objectId
        };
        return this.getWorkflowInstanceIdByObjectReference(objectReference)
            .then((response) => {
                let workflowInstanceId = response["workflowInstanceId"];
                this.getWorkflowHistoryByInstanceId(workflowInstanceId)
                    .then((response) => {
                        this.executeAction(action, role, workflowInstanceId, response);
                    }, (error) => {
                        console.log('Error occurred getting the history for instance id: ', workflowInstanceId);
                    });
            }, (error) => {
                console.log('Error occurred while getting the widget instance id for the object with the id ', objectId);
            });

    }

    executeAction(action, role, workflowInstanceId, response) {
        let postBody: any = this.workflows.postBody;
        //The user and role information will be implemented later on in the subsequesnt stories
        let token = localStorage['id'];
        let user = JSON.parse(token);
        postBody.user.id = user.email;
        postBody.user.role = role;
        postBody.action = action;
        postBody.document.history = [];
        if (response.history) {
            postBody.document.history = response.history;
        }
        // Execute the action on the workflow instance
        return this.doAction(workflowInstanceId, postBody)
            .then((response) => {

            }, (error) => {
                console.log('Error occurred executing the ' + postBody.action +
                    ' action for the worflow instance with the id ', workflowInstanceId);
            });
    }

}
