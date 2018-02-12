import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { HttpClientService } from './http-client.service';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/of';

@Injectable()
export class ManualMatchingOrganizationsService {
    private serviceRootUrl: string = "/api/manual-matching/items/";
    private actionServiceRootUrl: string = "/api/manual-matching/items/action/";

    constructor(private httpClient: HttpClientService) { }

    // Mocking up the data now, need to integrate with the backend service once it is ready
    getWorkflowItem(workOrganizationsSkey) {
        let data: any = {
            2000: {
                orgName: "Organization D",
                orgNum: 1004,
                address: "123 Wall Street, New York City, New York, 10005",
                workOrganizationSkey: 2000,
                updateUser: "PKulshrestha@msa.com",
                srcSystem: "POS",
                submittedBy: "Prafull"
            },
            2001: {
                orgName: "Organization A",
                orgNum: 1001,
                address: "127 Wall Street, New York City, New York, 1009",
                workOrganizationSkey: 2001,
                updateUser: "NSharma@msa.com",
                srcSystem: "POS",
                submittedBy: "Nidhi"
            },
            2002: {
                orgName: "Organization B",
                orgNum: 1002,
                address: "128 Wall Street, New York City, New York, 11000",
                workOrganizationSkey: 2002,
                updateUser: "BGupta@msa.com",
                srcSystem: "POS",
                submittedBy: "Bharat"
            },
            2003: {
                orgName: "Organization C",
                orgNum: 1003,
                address: "133 Wall Street, New York City, New York, 10007",
                workOrganizationSkey: 2003,
                updateUser: "ANtripathi@msa.com",
                srcSystem: "POS",
                submittedBy: "Anurag"
            }
        };
        return data[workOrganizationsSkey];
    }
}