import { Directive } from '@angular/core';
import { AbstractControl, Validator, ValidatorFn, FormControl, NG_VALIDATORS } from '@angular/forms';

import { Utils } from '../utils';

// validator to check if value is a positive number or not
export function requiredPositiveValidator(): ValidatorFn {
    return (control: AbstractControl) => {
        let invalidObj = {
            requiredPositive: {
                valid: false
            }
        };

        if(Utils.isEmpty(control.value)) // allow if empty
            return;

        var number = Number(control.value); // try to convert value to integer
        return !isNaN(number) && number > 0 ? null : invalidObj;
    }
}