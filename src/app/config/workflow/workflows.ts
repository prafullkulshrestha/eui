import { ItemCreationDefinition } from './item-creation-definition';
import { ItemManualMatchingDefinition } from './item-manual-matching-definition';
import { OrgManualMatchingDefinition } from './org-manual-matching-definition';

export class Workflows {

    itemCreation: any = ItemCreationDefinition.getItemCreationDefinition();
    itemManualMatching: any = ItemManualMatchingDefinition.getItemManualMatchingDefinition();
    orgManualMatching: any = OrgManualMatchingDefinition.getOrgManualMatchingDefinition();
    homeDashboard: any = {
        "myWorklist": {
            "milestones": [
                "item_cr_draft",
                "item_cr_review",
                "item_mm_inprogress",
                "org_mm_inprogress"
            ]
        }
    };
    postBody: any = {
        "user": {
            "id": "string",
            "role": "string"
        },
        "action": "string",
        "document": {
            "history": [
                {
                    "user": "string",
                    "action": "string",
                    "milestone": "string"
                }
            ]
        }
    };
    idCols: any = [
        "itemSkey",
        "workItemSkey",
        "workOrganizationSkey"
    ];
    worklist: any = {
        "dateFormat": "MM/dd/yyyy HH:mm:ss",
        "itemCreation": {
            "showWorkflow": false,
            "executeAction": true,
            "service": "itemsService",
            "method": "getItemMaster",
            "rowColumnsClasses": [
                "col-md-3",
                "col-md-3",
                "col-md-3",
                "col-md-3"
            ],
            "item_cr_draft": {
                "title": "Items > New Items in Draft",
                "subTitle": "Item(s) Master Drafts",
                "rowTitle": {
                    "columnKeys":[
                        "shortDescription"
                    ],
                    "columnClasses":[
                        "col-md-12"
                    ]
                },
                "idCol": "itemSkey",
                "wfAction": "Reassign",
                "detailsUrl": "/edit-item/draft/id",
                "workflowServiceMethod": "getObjectRefByState",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Modified By",
                    "Owner",
                    "UPC"],
                "rowColumnsKeys": [
                    "lastModified",
                    "updateUser",
                    "user",
                    "upc"]

            },
            "item_cr_review": {
                "title": "Items > New Items Awaiting Approval",
                "subTitle": "Item(s) For Review",
                "rowTitle": {
                    "columnKeys":[
                        "shortDescription"
                    ],
                    "columnClasses":[
                        "col-md-12"
                    ]
                },
                "idCol": "itemSkey",
                "wfAction": "Reassign",
                "detailsUrl": "/edit-item/draft/id",
                "workflowServiceMethod": "getObjectRefByState",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Modified By",
                    "Owner",
                    "UPC"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "updateUser",
                    "user",
                    "upc"
                ]
            }
        },
        "itemManualMatching": {
            "showWorkflow": false,
            "executeAction": true,
            "service": "manualMatchingItemsService",
            "method": "getWorkflowItem",
            "rowColumnsClasses": [
                "col-md-4",
                "col-md-4",
                "col-md-4"
            ],
            "item_mm_created": {
                "title": "Items > Items For Matching",
                "subTitle": "Item(s) Source Records",
                "rowTitle": {
                    "columnKeys":[
                        "upcDesc"
                    ],
                    "columnClasses":[
                        "col-md-12"
                    ]
                },
                "idCol": "workItemSkey",
                "wfAction": "Assigned",
                "detailsUrl": "/manual-matching/id",
                "workflowServiceMethod": "getObjectRefByState",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Source System",
                    "UPC"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "updateUser",
                    "srcSystem",
                    "submitterName"
                ]
            },
            "item_mm_inprogress": {
                "title": "Items > Items For Matching",
                "subTitle": "Item(s) Source Records",
                "rowTitle": {
                    "columnKeys":[
                        "upcDesc"
                    ],
                    "columnClasses":[
                        "col-md-12"
                    ]
                },
                "idCol": "workItemSkey",
                "wfAction": "Assigned",
                "detailsUrl": "/manual-matching/id",
                "workflowServiceMethod": "getObjectRefByState",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Source System",
                    "UPC"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "srcSystem",
                    "upcCode"
                ]
            }
        },
        "orgManualMatching": {
            "showWorkflow": false,
            "executeAction": true,
            "service": "manualMatchingOrganizationsService",
            "method": "getWorkflowItem",
            "rowColumnsClasses": [
                "col-md-3",
                "col-md-3",
                "col-md-3",
                "col-md-3"
            ],
            "org_mm_created": {
                "title": "Organizations > Organizations For Matching",
                "subTitle": "Organization(s) Source Records",
                "rowTitle": {
                    "columnKeys":[
                        "orgName",
                        "orgNum"
                    ]
                },
                "idCol": "workOrganizationSkey",
                "wfAction": "Assigned",
                "detailsUrl": "/org-manual-matching/id",
                "workflowServiceMethod": "getObjectRefByState",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Modified By",
                    "Source System",
                    "Submitted By"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "updateUser",
                    "srcSystem",
                    "submittedBy"
                ]
            },
            "org_mm_inprogress": {
                "title": "Items > Items For Matching",
                "subTitle": "Item(s) Source Records",
                "rowTitle": {
                    "columnKeys":[
                        "orgName",
                        "orgNum"
                    ]
                },
                "idCol": "workOrganizationSkey",
                "wfAction": "Assigned",
                "detailsUrl": "/org-manual-matching/id",
                "workflowServiceMethod": "getObjectRefByState",
                 "rowColumnsTitles": [
                    "Last Modified",
                    "Modified By",
                    "Source System",
                    "Submitted By"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "updateUser",
                    "srcSystem",
                    "submittedBy"
                ]
            }
        },
        "myWorklist": {
            "showWorkflow": true,
            "executeAction": false,
            "workflowColumnTitle": "Workflow",
            "workflowColumnKey": "objectState",
            "rowColumnsClasses": [
                "col-md-2",
                "col-md-2",
                "col-md-2",
                "col-md-2",
                "col-md-4"
            ],
            "assigned": {
                "title": "My Worklist",
                "subTitle": "Item(s) In Progress",
                "rowTitle": "upcDesc",
                "idCol": "workItemSkey",
                "wfAction": "Assigned",
                "detailsUrl": "/manual-matching/id",
                "workflowServiceMethod": "getObjectRefForUser",
                "rowColumnsTitles": [
                    "Last Modified",
                    "Source System",
                    "UPC"
                ],
                "rowColumnsKeys": [
                    "lastModified",
                    "srcSystem",
                    "upcCode"
                ],
                "rowColumnsClasses": [
                    "col-md-4",
                    "col-md-4",
                    "col-md-4"
                ]
            }
        }
    }

    createWorkflowInstancePostBody: any = {
        "objectId": "objectId"
    }
}