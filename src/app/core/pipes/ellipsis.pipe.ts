import { Pipe, PipeTransform } from '@angular/core';
import { Utils } from '../utils';

// pipe to add ellipsis if the given text is greater than its allowed length
@Pipe({
    name: 'ellipsis',
    pure: false
})
export class EllipsisPipe implements PipeTransform {
    transform(text: string, length: number): any {
        let ellipsis = "...";
        if(Utils.isEmpty(text)) 
            return "";

        if(text.length > length)
            return text.substring(0, length - ellipsis.length) + ellipsis;
        return text;
    }
}
