import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication/authentication.service';
import {MessageHelper} from './utilities/message-helper';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.authenticated.subscribe((authenticated) => {
      if (authenticated) {
        console.log(`Authentication completed.`);
        MessageHelper.alert('success', 'Authentication successful!');
      } else {
        console.warn('Authenticated failed.');
        MessageHelper.alert('error', 'Authentication failed!');
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
    return MessageHelper.messages;
  }

  set messages(value: any[]) {
    MessageHelper.messages = value;
  }

}
