import { AbstractControl, Validator, ValidatorFn, FormControl, NG_VALIDATORS } from '@angular/forms';
import { Utils } from "../utils";

export class DateRangeValidator {
    // validator to check if a value is specified. Trims strings on both sides.
    static datesRangeValidator(ac: AbstractControl) {
        let effStDt = ac.get('effectiveStartDate').value;
        let effEndDt = ac.get('effectiveEndDate').value;
        if (Utils.isEmpty(effEndDt)) {
            ac.get('effectiveEndDate').setErrors({ required: true })
        }
        else if (Utils.isEmpty(effStDt)) {
            ac.get('effectiveStartDate').setErrors({ required: true })
        }
        else if (effStDt >= effEndDt) {
            ac.get('effectiveEndDate').setErrors({ outsideRange: true })
        }
        else {
            ac.get('effectiveEndDate').setErrors(null);
            return null;
        }
    }
}