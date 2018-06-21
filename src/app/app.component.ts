import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication/authentication.service';
import {MessageHelper} from './utilities/message-helper';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _authenticationCompleted = false;

  constructor(private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.authenticationService.authorised.subscribe((authenticated) => {
      if (authenticated) {
        console.log(`Authentication completed.`);
        MessageHelper.alert('success', 'Authentication successful!');
        this._authenticationCompleted = true;
      } else {
        console.warn('Authenticated failed.');
        MessageHelper.alert('error', 'Authentication failed!');
      }
    });
  }

  logout() {
    this.authenticationService.logout();
  }

  get authenticationCompleted(): boolean {
    return this._authenticationCompleted;
  }

  get messages(): any[] {
    return MessageHelper.messages;
  }

  set messages(value: any[]) {
    MessageHelper.messages = value;
  }

}
