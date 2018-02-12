import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { HttpClientService } from './http-client.service';

@Injectable()
export class ItemsService {
    private serviceRootUrl: string = "/api/items/";

    constructor(private httpClient: HttpClientService) { }

    // get a list of related items based on search data specified
    getItemSearchResults(data) {
        return  this.httpClient
                    .post(this.serviceRootUrl+"itemsearch", data)
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // saves an item master
    saveItem(data) {
        return  this.httpClient
                    .post(this.serviceRootUrl, data)
                    .then((response: Response) => {
                        return response.json();
                    });
    }

    // deletes a draft version of an item master
    deleteDraft(itemSkey) {
        return  this.httpClient
                    .delete(this.serviceRootUrl + itemSkey)
                    .then((response: Response) => {
                        return response;
                    });
    }

    // get an item master
    getItemMaster(itemSkey: number) {
        return  this.httpClient
                    .get(this.serviceRootUrl + itemSkey)
                    .then((response: Response) => {
                        return response.json();
                    });
    }
}
