import { AbstractControl, Validator, ValidatorFn, FormControl, NG_VALIDATORS } from '@angular/forms';

// validator to check if a value is specified. Trims strings on both sides.
export function requiredTrimmedValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        if (!control.value || typeof control.value === 'string' && !control.value.trim()) {
            return {
                requiredTrimmed: {
                    valid: false
                }
            };
        } else {
            return null;
        }
    }
}