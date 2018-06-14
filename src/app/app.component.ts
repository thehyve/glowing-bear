import {MessageService} from './services/message.service';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication/authentication.service';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService,
              private messageService: MessageService) {
  }

  ngOnInit() {
    this.authenticated.subscribe((authenticated) => {
      if (authenticated) {
        console.log(`Authentication completed.`);
        this.messageService.alert('info', 'Authentication successful!');
      } else {
        console.warn('Authenticated failed.');
      }
    });
  }

  logout() {
    this.authenticationService.logout();
  }

  get authenticated(): BehaviorSubject<boolean> {
    return this.authenticationService.authorised;
  }

  get messages(): any[] {
    return this.messageService.messages;
  }

  set messages(value: any[]) {
    this.messageService.messages = value;
  }

}
