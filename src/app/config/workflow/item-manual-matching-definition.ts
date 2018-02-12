export module ItemManualMatchingDefinition {

    export function getItemManualMatchingDefinition() {
        return {
            "wfModel": {
                "id": "itemManualMatching",
                "name": "Item manual matching",
                "description": "Item manual matching workflow",
                "defaultMilestone": "item_mm_created",
                "roles": {
                    "Tier5": {
                        "id": "Tier5",
                        "name": "Tier5",
                        "description": "Manual Matcher"
                    }
                },
                "actions": {
                    "New": {
                        "id": "New",
                        "name": "New item for manual matching",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "_lastmilestone",
                        "description": "New item for manual matching"
                    },
                    "Skip": {
                        "id": "Skip",
                        "name": "Skipped Item",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "item_mm_created",
                        "description": "Item is skipped from matching"
                    },
                    "Match": {
                        "id": "Match",
                        "name": "Matched Item",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "item_mm_matched",
                        "description": "Item is matched"
                    },
                    "Assigned": {
                        "id": "Assigned",
                        "name": "Assigned Item",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "item_mm_inprogress",
                        "description": "Item is assigned"
                    }
                },
                "milestones": {
                    "item_mm_created": {
                        "id": "item_mm_created",
                        "name": "New Manual Matching Item",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [
                            "New",
                            "Assigned"
                        ],
                        "description": "New Item for manual matching"
                    },
                    "item_mm_matched": {
                        "id": "item_mm_matched",
                        "name": "Matched Item",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [],
                        "description": "Item is matched to a master"
                    },
                    "item_mm_inprogress": {
                        "id": "item_mm_inprogress",
                        "name": "Item matching in progress",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [
                            "Match",
                            "Skip"
                        ],
                        "description": "Item matching is in progress"
                    }
                },
                "document": {
                    "history": []
                }
            }
        };
    }
}