import { AbstractControl, ValidatorFn } from '@angular/forms';

// validator to check if value is specified for a given attribute
export function validateAttributeChoice(): ValidatorFn {
    return (control: AbstractControl) => {
        if (!control.value || !control.value.masterAttrValCode) {
            return {
                attributeChoice: {
                    valid: false
                }
            };
        } else {
            return null;
        }
    }
}