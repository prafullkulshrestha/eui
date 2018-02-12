export module OrgManualMatchingDefinition {

    export function getOrgManualMatchingDefinition() {
        return {
            "wfModel": {
                "id": "orgManualMatching",
                "name": "Organization manual matching",
                "description": "Organization manual matching workflow",
                "defaultMilestone": "org_mm_created",
                "roles": {
                    "Tier5": {
                        "id": "Tier5",
                        "name": "Tier5",
                        "description": "Organization Manual Matcher"
                    }
                },
                "actions": {
                    "New": {
                        "id": "New",
                        "name": "New organazation for organazation manual matching",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "_lastmilestone",
                        "description": "New organazation for organazation manual matching"
                    },
                    "Skip": {
                        "id": "Skip",
                        "name": "Skipped organization match",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "org_mm_created",
                        "description": "Organization is skipped from matching"
                    },
                    "Match": {
                        "id": "Match",
                        "name": "Matched Organization",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "org_mm_matched",
                        "description": "Organazation is matched"
                    },
                    "Assigned": {
                        "id": "Assigned",
                        "name": "Assigned Organazation",
                        "role": [
                            "Tier5"
                        ],
                        "milestone": "org_mm_inprogress",
                        "description": "Organazation is assigned"
                    }
                },
                "milestones": {
                    "org_mm_created": {
                        "id": "org_mm_created",
                        "name": "New Manual Matching Organazation",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [
                            "New",
                            "Assigned"
                        ],
                        "description": "New organazation for manual matching"
                    },
                    "org_mm_matched": {
                        "id": "org_mm_matched",
                        "name": "Matched Organazation",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [],
                        "description": "Organazation is matched to a master"
                    },
                    "org_mm_inprogress": {
                        "id": "org_mm_inprogress",
                        "name": "Organazation matching in progress",
                        "role": [
                            "Tier5"
                        ],
                        "actions": [
                            "Match",
                            "Skip"
                        ],
                        "description": "Organazation matching is in progress"
                    }
                },
                "document": {
                    "history": []
                }
            }
        };
    }
}