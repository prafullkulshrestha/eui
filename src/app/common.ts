import { Utils } from './core/utils';

export module Common {

    // gets an existing attr in attr collection by attr name
    export function findAttrInItemByAttrName(item, attrName) {
        let attributes = item.attributes;

        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i].attrName === attrName) {
                return attributes[i];
            }
        }

        return null;
    }

    // checks to see if attribute values are equal
    export function hasSameAttrValue(attr, attrToCompare) {
        if (typeof attr.attrValue === "object") {
            return attr.attrValue.attrCode === attrToCompare.attrValue.attrCode;
        } else {
            return attr.attrValue === attrToCompare.attrValue;
        }
    }

    // get ordered list of attributes
    export function getOrderedAttrList(attributes: any[], type: string): any[] {
        return attributes.filter((attr) => attr.masterAttrBusImp.trim() === type)
            .map((attr) => {
                var ft = attr.masterAttrType.trim();
                if (ft.substring(0, 4) === "TEXT") {
                    if (attr.masterAttributeChoices === null ||
                        attr.masterAttributeChoices.length === 0 ||
                        attr.masterAttributeChoices[0].masterAttrValCode.trim() === "") {
                        attr.fieldType = "TEXT";
                    }
                    else {
                        attr.fieldType = "COMBO";
                        let attrValList = attr.masterAttributeChoices;
                        attr.attrValue = null;
                        for (var i = 0; i < attrValList.length; i++) {
                            if (attrValList[i].isDefaultVal) {
                                attr.attrValue = attrValList[i];
                                break;
                            }
                        }
                    }
                }
                else {
                    attr.fieldType = ft;
                }

                return attr;
            })
            .sort((attr1, attr2) => attr1.masterAttrDisplaySeq - attr2.masterAttrDisplaySeq);
    }

    // prepares an item master to be displayed
    export function prepareItemForDisplay(attrList, item) {
        let displayItem: any = {};
        displayItem.itemSkey = item.itemSkey;
        displayItem.itemType = item.itemType;
        displayItem.componentItems = item.componentItems;
        displayItem.effStartDt = item.effStartDt;
        displayItem.effEndDt = item.effEndDt;
        displayItem.upc = item.upc;
        displayItem.sector = item.industrySector;
        displayItem.segment = item.industrySegment;
        displayItem.class = item.industryClass;
        displayItem.shortDescription = item.shortDescription;
        displayItem.primaryAttributes = [];
        displayItem.secondaryAttributes = [];

        ["primaryAttributes", "secondaryAttributes"].forEach((type) => {
            attrList[type].forEach((attr) => {
                let tAttr = item.attributes.filter((t) => { return t.attrName === attr.masterAttrName; })[0];
                displayItem[type].push({
                    label: attr.masterAttrDisplayName,
                    value: !Utils.isEmpty(tAttr) ? (typeof tAttr.attrValue === "object" ? tAttr.attrValue.attrLongName : tAttr.attrValue) : "",
                    attrValue: !Utils.isEmpty(tAttr) ? tAttr.attrValue : null
                });
            });
        });

        return displayItem;
    }

    // prepares the request obj for all the attributes
    export function buildAttrsReqObj(attrs, attrsFormArray) {
        let attrsReqObj = [];

        for (var i = 0; i < attrsFormArray.length; i++) {
            let value = attrsFormArray[i];
            let attr: any = {};
            attr.attrName = attrs[i].masterAttrName;

            if (!Utils.isEmpty(value)) {
                if (typeof value === "object") {
                    if (!Utils.isEmpty(value.masterAttrValCode)) {
                        attr.attrValue = {
                            classAttrValSkey: value.classAttrValSkey ? value.classAttrValSkey : "",
                            attrCode: value.masterAttrValCode ? value.masterAttrValCode : "",
                            attrLongName: value.masterAttrValLongName ? value.masterAttrValLongName : "",
                            attrShortName: value.masterAttrValShortName ? value.masterAttrValShortName : ""
                        };
                        attrsReqObj.push(attr);
                    }
                } else {
                    attr.attrValue = value ? value.trim() : "";
                    attrsReqObj.push(attr);
                }
            }
        }

        return attrsReqObj;
    }

    // get part item description by primary or secondary attrs
    export function getItemDescByAttrs(attrs, type) {
        if (Utils.isEmpty(attrs)) return;

        let vals = [];
        attrs.forEach((attr) => {
            if (!Utils.isEmpty(attr.attrValue)) {
                if (attr.masterAttrDescSeq !== 0) {
                    let val;

                    if (typeof attr.attrValue === "object") {
                        val = type === 'short' ? attr.attrValue.masterAttrValShortName : attr.attrValue.masterAttrValLongName;
                    }
                    else {
                        val = attr.attrValue;
                    }

                    if (!Utils.isEmpty(val))
                        vals.push(val);
                }
            }
        });

        return vals.join(' ');
    }

    // get short or long item desc
    export function getItemDesc(primaryAttrs, secondaryAttrs, type) {
        let desc = Common.getItemDescByAttrs(primaryAttrs, type) + ' ' +
            Common.getItemDescByAttrs(secondaryAttrs, type);
        return desc.trim();
    }

    // get set of matching attributes across a set of attributes of items
    export function getMatchingAttributes(items) {
        if (items.length === 0) return null;
        if (items.length === 1) return items[0];

        let matchedItem: any = {};
        let currentItem = items[0];
        let matchCountBasicProps = {
            sector: 1,
            segment: 1,
            class: 1
        };

        // finding match in sector, segment and class
        for (let t = 1; t < items.length; t++) {
            if (currentItem.industrySector === items[t].industrySector)
                matchCountBasicProps.sector++;
            if (currentItem.industrySegment === items[t].industrySegment)
                matchCountBasicProps.segment++;
            if (currentItem.industryClass === items[t].industryClass)
                matchCountBasicProps.class++;
        }

        if (matchCountBasicProps.sector !== items.length ||
            matchCountBasicProps.segment !== items.length ||
            matchCountBasicProps.class !== items.length)
            return null;

        matchedItem.industrySector = matchCountBasicProps.sector === items.length ? currentItem.industrySector : null;
        matchedItem.industrySegment = matchCountBasicProps.segment === items.length ? currentItem.industrySegment : null;
        matchedItem.industryClass = matchCountBasicProps.class === items.length ? currentItem.industryClass : null;

        // finding attribute matches
        let matchingAttributes = [];
        for (let i = 0; i < currentItem.attributes.length; i++) {
            let currentAttr = currentItem.attributes[i];
            let matchCount = 0;

            for (let t = 1; t < items.length; t++) {
                let foundAttr = Common.findAttrInItemByAttrName(items[t], currentAttr.attrName);
                if (!Utils.isEmpty(foundAttr) && Common.hasSameAttrValue(currentAttr, foundAttr))
                    matchCount++;
                else
                    break;
            }

            if (matchCount === (items.length - 1)) {
                matchingAttributes.push(currentAttr);
            }
        }

        matchedItem.attributes = matchingAttributes;
        return matchedItem;
    }

    export function setAttrValuesForItem(item, attributeValuesToSet) {
        ["primaryAttributes", "secondaryAttributes"].forEach((type) => {
            item[type].forEach((attr) => {
                let refAttrValue = null;
                for (let i = 0; i < attributeValuesToSet.length; i++) {
                    if (attributeValuesToSet[i].attrName === attr.masterAttrName) {
                        refAttrValue = attributeValuesToSet[i].attrValue;
                        break;
                    }
                }

                if (!Utils.isEmpty(refAttrValue)) {
                    if (typeof refAttrValue === "object") {
                        let temp = Utils.isEmpty(attr.attrValue) ? {} : attr.attrValue;
                        temp.masterAttrValCode = refAttrValue.attrCode;
                        temp.masterAttrValLongName = refAttrValue.attrLongName;
                        temp.masterAttrValShortName = refAttrValue.attrShortName;
                        temp.classAttrValSkey = refAttrValue.classAttrValSkey;
                        attr.attrValue = temp;
                    }
                    else {
                        attr.attrValue = refAttrValue;
                    }
                }
            });
        });
    }
}