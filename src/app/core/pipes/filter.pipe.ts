import { Pipe, PipeTransform } from '@angular/core';

// pipe to filter list items
@Pipe({
    name: 'filter',
    pure: false
})
export class FilterPipe implements PipeTransform {
    transform(items: any[], filter): any {
        if (!items || !filter) {
            return items;
        }
        
        // filters only based on the first key of the specified object
        var key = Object.keys(filter)[0];
        var filterValue = filter[key];
        
        return items.filter(item => item[key].toLowerCase().indexOf(filterValue.toLowerCase()) !== -1);
    }
}