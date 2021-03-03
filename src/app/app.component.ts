/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import {MessageService} from 'primeng/api'
import {MessageHelper} from './utilities/message-helper';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _authenticationCompleted = false;

  constructor(private authenticationService: AuthenticationService, private messageService: MessageService) {
    // provide instance of MessageService to the MessageHelper
    MessageHelper.messageService = messageService;
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
    //this.testww();
  }

  get authenticationCompleted(): boolean {
    return this._authenticationCompleted;
  }

  // testww(): void {
  //   if (typeof Worker !== 'undefined') {
  //     const worker = new Worker('./workers/decryption.worker', { type: 'module' });
  //     let xx: WorkerDecryptionRequest;
  //
  //     worker.onmessage = ({ data }) => {
  //       console.log(`page got message: ${data}`);
  //     };
  //     worker.onerror = ({ error }) => {
  //
  //     };
  //     worker.postMessage('hello');
  //   } else {
  //     MessageHelper.alert('error', 'Your browser does not support web workers')
  //   }
  // }

}
