import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { HttpClientService } from './http-client.service';
import { Utils } from '../core/utils';

@Injectable()
export class ItemsAttributeService {
    private serviceRootUrl: string = "/api/items/attributes";

    //list of sector, segment and class
    sectorSegmentClassList: any[] = [];

    // list of attribute where sector, segment and class collectively works as the key
    attrsList = {};

    // list of attribute promises where sector, segment and class collectively works as the key
    attrListPromises = {};

    constructor(private httpClient: HttpClientService) { }

    // load all sector, segment and class
    loadSectorSegmentClass() {
        return this.httpClient
            .get(this.serviceRootUrl)
            .then((response: Response) => {
                this.sectorSegmentClassList = response.json();
            });
    }

    // get list of all sectors
    getSectors() {
        return this.sectorSegmentClassList;
    }

    // get list of segments by a given sector
    getSegmentsBySector(sector): any[] {
        let sectorObj = this.sectorSegmentClassList
            .filter((item) => { return item.industrySector === sector })[0];

        return sectorObj ? sectorObj.industrySegments : [];
    }

    // get list of classes based on a given sector and segment
    getClassesBySectorSegment(sector, segment): any[] {
        let segments = this.getSegmentsBySector(sector);
        let segmentObj = segments.filter((item) => { return item.industrySegment === segment })[0];

        return segmentObj ? segmentObj.industryClasses : [];
    }

    // get list of external links based on a given sector, segment and class
    getExternalLinks(sector, segment, className): any[] {
        if (sector === null || segment === null || className === null)
            return [];
        else {
            let classes = this.getClassesBySectorSegment(sector, segment);
            let classObj = classes.filter((item) => { return item.industryClass === className })[0];

            return classObj ? classObj.externalLinks : [];
        }
    }

    // get list of configured attributes for a specific sector, segment and class
    getAttributes(params) {
        let key = params.industrySector + "_" + params.industrySegment + "_" + params.industryClass;
        if (Utils.isEmpty(this.attrsList[key])) { // TODO: add condition to check for new params
            // return this.http.get("assets/attr-list.json")
            if(Utils.isEmpty(this.attrListPromises[key])) {
                this.attrListPromises[key] = this.httpClient
                            .post(this.serviceRootUrl, params)
                            .then((response: Response) => {
                                this.attrsList[key] = response.json();
                                return this.attrsList[key];
                            });
                return this.attrListPromises[key];
            }
            else {
                return this.attrListPromises[key];
            }
        }
        else {
            return Promise.resolve(this.attrsList[key]);
        }
    }
}
