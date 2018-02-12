export module ItemCreationDefinition {

    export function getItemCreationDefinition() {
        return {
            "wfModel": {
                "id": "itemCreation",
                "name": "New item creation",
                "description": "New item creation workflow",
                "defaultMilestone": "item_cr_draft",
                "roles": {
                    "Tier1": {
                        "id": "Tier1",
                        "name": "Tier1",
                        "description": "A user with the Tier1 role"
                    },
                    "Tier2": {
                        "id": "Tier2",
                        "name": "Tier2",
                        "description": "A user with the Tier2 role"
                    },
                    "Tier3": {
                        "id": "Tier3",
                        "name": "Tier3",
                        "description": "A user with the Tier3 role"
                    },
                    "Tier4": {
                        "id": "Tier4",
                        "name": "Tier4",
                        "description": "A user with the Tier4 role"
                    },
                    "Tier5": {
                        "id": "Tier5",
                        "name": "Tier5",
                        "description": "A user with the Tier5 role"
                    }
                },
                "actions": {
                    "Save": {
                        "id": "Save",
                        "name": "Save Item",
                        "description": "Save Item",
                        "role": [
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4",
                            "Tier5"
                        ],
                        "milestone": "_lastmilestone"
                    },
                    "Submit": {
                        "id": "Submit",
                        "name": "Submit",
                        "description": "Submit Item For Reiview",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "item_cr_review"
                    },
                    "Reassign": {
                        "id": "Reassign",
                        "name": "Reassign",
                        "description": "Reassign Item",
                        "role": [
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4",
                            "Tier5"
                        ],
                        "milestone": "_lastmilestone"
                    },
                    "Publish": {
                        "id": "Publish",
                        "name": "Publish",
                        "description": "Publish Item",
                        "role": [
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4"
                        ],
                        "milestone": "item_cr_published"
                    },
                    "Delete_Draft": {
                        "id": "Delete_Draft",
                        "name": "Delete_Draft",
                        "description": "Delete Draft",
                        "role": [
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4",
                            "Tier5"
                        ],
                        "milestone": "item_cr_deleted"
                    }
                },
                "milestones": {
                    "item_cr_draft": {
                        "id": "item_cr_draft",
                        "name": "Draft",
                        "description": "Draft Version Created",
                        "role": [
                            "_lastowner",
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4",
                            "Tier5"
                        ],
                        "actions": [
                            "Save",
                            "Submit",
                            "Reassign",
                            "Publish",
                            "Delete_Draft"
                        ]
                    },
                    "item_cr_review": {
                        "id": "item_cr_review",
                        "name": "Review",
                        "description": "Ready For Review",
                        "role": [
                            "Tier1",
                            "Tier2",
                            "Tier3",
                            "Tier4",
                            "Tier5"
                        ],
                        "actions": [
                            "Publish",
                            "Save",
                            "Reassign",
                            "Delete_Draft"
                        ]
                    },
                    "item_cr_published": {
                        "id": "item_cr_published",
                        "name": "Published",
                        "description": "Item Published",
                        "role": [
                            "Tier1"
                        ],
                        "actions": []
                    },
                    "item_cr_deleted": {
                        "id": "item_cr_deleted",
                        "name": "Delete Draft",
                        "description": "Item Deleted",
                        "role": [
                        ],
                        "actions": []
                    }
                }
            },
            "document": {
                "history": []
            }
        };
    }

}