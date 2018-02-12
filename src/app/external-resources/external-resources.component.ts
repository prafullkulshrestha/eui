import { Component, Input, OnChanges } from '@angular/core';
import { Utils } from '../core/utils';

declare function escape(s: string): string;

@Component({
    selector: 'external-resources',
    templateUrl: './external-resources.component.html',
    styleUrls: ['./external-resources.component.css']
})
export class ExternalResourcesComponent implements OnChanges {
    private defaultResource = { linkUrl: "www.google.com", linkDesc: "Google search with selected attributes", linkName: "Google" };
    
    @Input() withDefaultResources: boolean = false;
    @Input() resources: any[] = [];
    @Input() attributeForm: any;

    ngOnChanges() {
        if(Utils.isEmpty(this.resources) || this.resources.length === 0) {
            if (this.withDefaultResources) {
                this.resources = [this.defaultResource];
            } else {
                this.resources = [];
            }
        }
    }

    // opens an external resource link in a new browser tab
    openLink(index) {
        let externalLink = this.resources[index];
        let baseUrl = externalLink.linkUrl;
        let searchParam = "";
        let openInNewTab = "_blank";

        // if resource is Google then construct the google serach parameter
        if (externalLink.linkName.toLowerCase() === "google") {
            if (!Utils.isEmpty(this.attributeForm)) {
                searchParam = "";
                let formValues = this.attributeForm.value;

                if (formValues.upc) searchParam += formValues.upc + "+";

                for (var i = 0; i < formValues.primaryAttributesFormArray.length; i++) {
                    let value = formValues.primaryAttributesFormArray[i].attrValue;
                    let attr: any = {};

                    if (typeof value === "object" && !Utils.isEmpty(value)) {
                        if (!Utils.isEmpty(value.masterAttrValCode))
                            searchParam += value.masterAttrValLongName.trim() + "+";
                    } else {
                        if (value)
                            searchParam += value.trim() + "+";
                    }
                }
            }

            let url = "http://www.google.com/search?q=" + 
                       escape(searchParam.substring(0, searchParam.length - 1));
            window.open(url, openInNewTab);
        }
        else {
            window.open(baseUrl, openInNewTab);
        }
    }
}