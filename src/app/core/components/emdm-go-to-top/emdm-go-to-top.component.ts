import { Component, OnInit, ViewEncapsulation } from '@angular/core';

declare var $;

@Component({
  selector: 'emdm-go-to-top',
  templateUrl: './emdm-go-to-top.component.html',
  styleUrls: ['./emdm-go-to-top.component.css'],
  encapsulation: ViewEncapsulation.None,
  host: {
      '(document:scroll)': 'onDocumentScroll()'
  }
})
export class EmdmGoToTopComponent implements OnInit {

  visible: boolean = false;

  constructor() { }

  ngOnInit() {
  }

  // listener function called on document scroll
  onDocumentScroll() {
    if($(document).scrollTop() > 1000)
      this.visible = true;
    else
      this.visible = false;
  }

  // scroll to top of window
  goToTop() {
    $('html, body').animate({ scrollTop: 0 }, 400);
  }

}
