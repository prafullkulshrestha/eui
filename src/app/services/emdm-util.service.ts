import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { HttpClientService } from './http-client.service';

@Injectable()
export class EmdmUtilService {

    constructor(private httpClient: HttpClientService) { }

    checkUPCValidity(upc) {
        return  this.httpClient.post("/api/mdm-util/standardize-upc", { upc: upc })
                    .then((response: Response) => {
                        return response.json();
                    });
    }
}
