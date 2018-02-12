import { Component, OnInit } from '@angular/core';
import { Input, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { Utils } from "app/core/utils";

declare var $: any;

@Component({
  selector: 'comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class CommentsComponent implements OnInit {

  commentText: any;

  @Input() limit: number;
  @Input() comments: any = [];

  @ViewChild("expandedComments") expandedComments: ElementRef;

  constructor() { }

  ngOnInit() { }

  addComment() {
    if (this.commentText.trim().length > 0) {
      let token = localStorage['id'];
      let user = JSON.parse(token);
      this.comments.unshift({ "email": user.email, "text": this.commentText.trim(), "createdDate": Utils.getDateTime() });
    }
    this.commentText = '';
  }

  deleteComment(i) {
    this.comments.splice(i, 1);
  }

  clearComment() {
    this.commentText = '';
  }

  // show comments in a modal
  showAllcomments() {
    $(this.expandedComments.nativeElement).modal('show');
  }
}
