/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication.service';
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
    this.authenticationService.userLoggedIn.subscribe((loggedIn) => {
      if (loggedIn) {
        console.log(`Authentication completed.`);
        MessageHelper.alert('success', 'Authentication successful!');
        this._authenticationCompleted = true;
      } else {
        console.warn('Authenticated failed.');
        MessageHelper.alert('error', 'Authentication failed!');
      }
    });
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

if (typeof Worker !== 'undefined') {
  // Create a new
  const worker = new Worker('./app.worker', { type: 'module' });
  worker.onmessage = ({ data }) => {
    console.log(`page got message: ${data}`);
  };
  worker.postMessage('hello');
} else {
  // Web Workers are not supported in this environment.
  // You should add a fallback so that your program still executes correctly.
}