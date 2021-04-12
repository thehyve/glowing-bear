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
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  private _authenticationCompleted;

  constructor(private toastr: ToastrService,
              private authenticationService: AuthenticationService,
              private deviceService: DeviceDetectorService) {
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

      this.browserCompatibilityWarning();
    });
  }

  private browserCompatibilityWarning() {
    if (!this.deviceService.isDesktop()) {
      MessageHelper.alert('warn', 'This app has not been tested on mobile and tablet environments, we advise to use a desktop.')
    }

    const bName = this.deviceService.browser.toLowerCase();
    const bVersion = parseInt(this.deviceService.browser_version, 10);
    if (!(bName.includes('chrome') && bVersion >= 80) &&
      !(bName.includes('firefox') && bVersion >= 78) &&
      !(bName.includes('safari') && bVersion >= 13) &&
      !(bName.includes('opera') && bVersion >= 67)
    ) {
      MessageHelper.alert('warn',
        `This app has not been tested with your browser (${this.deviceService.browser} ${this.deviceService.browser_version})`
        + ', we advise to use a recent version of Chrome of Firefox.'
      );
    }
  }

  get authenticationCompleted(): boolean {
    return this._authenticationCompleted;
  }
}
