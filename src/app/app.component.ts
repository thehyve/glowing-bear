/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import {MessageHelper} from './utilities/message-helper';
import {ToastrService} from 'ngx-toastr';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _authenticationCompleted;

  constructor(private toastr: ToastrService, private authenticationService: AuthenticationService) {
    this._authenticationCompleted = false;
    // inject toaster service in the MessageHelper
    MessageHelper.toastrService = this.toastr;
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
}
