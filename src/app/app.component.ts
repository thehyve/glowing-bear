/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from './services/authentication/authentication.service';
import {MessageHelper} from './utilities/message-helper';
import {CompatibilityHelper} from './utilities/compatibility-helper';
import {ResourceService} from './services/resource.service';
import {ServerStatus} from './models/server-status';
import {AppConfig} from './config/app.config';
import {AccessLevel} from './services/authentication/access-level';
import {Router, NavigationEnd} from '@angular/router';
import {NavbarService} from './services/navbar.service';

@Component({
  selector: 'gb-app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  docUrl: string = null;
  appVersion: string;

  private _authenticationCompleted = false;
  private _accessLevel: AccessLevel = null;
  private _serverStatus = ServerStatus.NONE;

  constructor(private authenticationService: AuthenticationService,
              private resourceService: ResourceService,
              private config: AppConfig,
              private router: Router,
              private navbarService: NavbarService) {
    if (this.config.isLoaded) {
      this.docUrl = config.getConfig('doc-url');
    }
    this.appVersion = config.version;
  }

  ngOnInit() {
    if (!this.config.isLoaded) {
      return;
    }
    this.authenticationService.authorised.subscribe((authenticated) => {
      if (authenticated) {
        this._authenticationCompleted = true;
        this.authenticationService.accessLevel.subscribe((accessLevel) => {
          this._accessLevel = accessLevel;
          if (accessLevel && accessLevel !== AccessLevel.None) {
            if (this.config.getConfig('check-server-status')) {
              this.resourceService.status.subscribe((serverStatus) => {
                this._serverStatus = serverStatus;
              });
              this.resourceService.init();
            } else {
              this._serverStatus = ServerStatus.UP;
            }
          }
        });
      } else {
        console.warn('Authenticated failed.');
      }
    });
    if (CompatibilityHelper.isMSIE()) {
      MessageHelper.alert('error', 'Microsoft Internet Explorer is not supported\n' +
        'Some features may not work correctly.');
    }
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let whichStep = event.urlAfterRedirects.split('/')[1].split('#')[0];
        this.navbarService.updateNavbar(whichStep);
      }
    });
  }

  logout() {
    this.authenticationService.logout();
  }

  get configLoaded(): boolean {
    return this.config.isLoaded;
  }

  get configError(): string {
    return this.config.configError;
  }

  get authenticationCompleted(): boolean {
    return this._authenticationCompleted;
  }

  get authenticatedAndServerUp(): boolean {
    return this._authenticationCompleted &&
      this._accessLevel && this._accessLevel !== AccessLevel.None &&
      this._serverStatus === ServerStatus.UP;
  }

  get isAccessDenied(): boolean {
    return this._authenticationCompleted &&
      this._accessLevel && this._accessLevel === AccessLevel.None;
  }

  get serverDown(): boolean {
    return this._authenticationCompleted &&
      this._accessLevel && this._accessLevel !== AccessLevel.None &&
      this._serverStatus === ServerStatus.DOWN;
  }

  get serverError(): boolean {
    return this._authenticationCompleted &&
      this._accessLevel && this._accessLevel !== AccessLevel.None &&
      this._serverStatus === ServerStatus.ERROR;
  }

  get messages(): any[] {
    return MessageHelper.messages;
  }

  set messages(value: any[]) {
    MessageHelper.messages = value;
  }

}
