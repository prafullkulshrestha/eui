import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { HttpClientService } from './http-client.service';

@Injectable()
export class ManualMatchingItemsService { 
    private serviceRootUrl: string = "/api/manual-matching/items/";
    private actionServiceRootUrl: string = "/api/manual-matching/items/action/";

    constructor(private httpClient: HttpClientService) { }

    // get a list of related items based on search data specified
    getWorkflowItem(workItemsSkey) {
        return  this.httpClient
                    .get(this.serviceRootUrl + workItemsSkey)
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // get a list of related items based on search data specified
    matchWorkflowItem(params) {
        return  this.httpClient
                    .post(this.actionServiceRootUrl + "confirm-match", {
                        workItemSkey: params.workItemSkey,
                        itemMasterSkey: params.itemMasterSkey,
                        entItemUnivId: params.entItemUnivId,
                        comments: params.comments || []
                    })
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // match a draft item master to a workflow item
    matchWorkflowItemToDraft(params) {
        return  this.httpClient
                    .post(this.actionServiceRootUrl + "save-draft", {
                        workItemSkey : params.workItemSkey,
                        itemMasterSkey : params.itemMasterSkey
                    })
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // unlink a matched draft from a workflow item
    unlinkMatchedDraft(itemSkey) {
        return  this.httpClient
                    .post(this.actionServiceRootUrl + "delete-draft/" + itemSkey, null)
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // Match workflow item while publishing a new item
    matchIfApplicable(itemSkey) {
        return  this.httpClient
                    .post(this.actionServiceRootUrl + "publish-item/" + itemSkey, null)
                    .then((response: Response) => {
                        return response.json();
                    });
    }
}