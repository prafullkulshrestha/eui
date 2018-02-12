import { DatePipe } from '@angular/common';
declare var $: any; // jquery ref

export module Utils {
    // returns deep copy of an object
    export function deepCopy(obj) {
        return $.extend(true, {}, obj);
    }

    // checks if the object is undefined or null or empty in case of strings
    export function isEmpty(obj) {
        return typeof obj === "undefined" ||
            obj === null ||
            (typeof obj === "string" && (obj === "" || obj.trim() === ""));
    }

    export function getDateTime() {
        var dt = new Date();
        let date = dt.toJSON().slice(0, 10).split("-").join("/");
        let time = dt.toTimeString().slice(0, 8);
        return date + ' ' + time;
    }

    export function formatNumber(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    export function transformDate(date, dateformat) {
        //hard coding en-US for now, will change the it to make a generic implmentation 
        //later on
        let datePipe = new DatePipe("en-US");
        let dateObj = new Date(date);
        return datePipe.transform(dateObj, dateformat);
    }
}