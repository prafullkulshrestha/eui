import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  private errorMessages = [
    "This page exists in anti-universe. You certainly do not belong there.",
    "I am built on Angular. Now I have been NgZoned.",
    "I am Jon Snow. I don't know where the page is.",
    "Gollum lost his precious.",
    "The Dark Night prevails but the Dark Knight will rise again. Give him some time maybe.",
    "I found you but I lost myself.",
    "What you are seeing is not real. There is a page on top of me, and another one on top of that and then there's this one. By the way, I am not dreaming."
  ];

  errorMessage: string;

  constructor() { }

  ngOnInit() {
    let currentIndex = Math.floor(Math.random() * (this.errorMessages.length));
    this.errorMessage = this.errorMessages[currentIndex];
  }

}
