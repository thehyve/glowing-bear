/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable, Injector, OnDestroy} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable, AsyncSubject} from 'rxjs';
import {AuthenticationMethod} from './authentication-method';
import {Oauth2Authentication} from './oauth2-authentication';
import {AuthorizationResult} from './authorization-result';
import {AccessLevel} from './access-level';
import * as jwt_decode from 'jwt-decode';

@Injectable()
export class AuthenticationService implements OnDestroy {

  private config: AppConfig;
  private authenticationMethod: AuthenticationMethod;
  private _accessLevel: AccessLevel = AccessLevel.Restricted;

  static getAccessLevelFromRoles(roles: string[]): AccessLevel {
    if (roles.includes('ROLE_ADMIN')) {
      return AccessLevel.Full;
    }
    let rolesPerStudy = new Map<string, string[]>();
    roles.forEach((role) => {
      let parts = role.split('|');
      if (parts.length === 2) {
        let studyId = parts[0];
        let level = parts[1];
        let studyRoles = rolesPerStudy.get(studyId);
        if (!studyRoles) {
          studyRoles = [];
        }
        studyRoles.push(level);
        rolesPerStudy.set(studyId, studyRoles);
      }
    });
    if (rolesPerStudy.size === 0) {
      // No permissions means restricted access.
      return AccessLevel.Restricted;
    }
    let iterator = rolesPerStudy.values();
    for (let item = iterator.next(); !item.done; item = iterator.next()) {
      // Access is restricted if for some study we do not have measurements access.
      if (!item.value.includes('MEASUREMENTS')) {
        return AccessLevel.Restricted;
      }
    }
    return AccessLevel.Full;
  }

  constructor(private injector: Injector) { }

  /**
   * Parse the decoded token, determine the access level
   */
  private readAccessLevelFromToken() {
    let serviceType = this.config.getConfig('authentication-service-type', 'oidc');
    switch (serviceType) {
      case 'oidc':
        const clientId = this.config.getConfig('oidc-client-id', 'transmart-client');
        try {
          let token = jwt_decode(this.token);
          if (token['resource_access']) {
            let clientAccess = token['resource_access'][clientId];
            if (clientAccess) {
              let roles = clientAccess['roles'];
              if (roles && roles.constructor === Array && roles.length > 0) {
                this.accessLevel = AuthenticationService.getAccessLevelFromRoles(roles);
                console.log(`Access level: ${this.accessLevel}`);
              }
            }
          }
        } catch (e) {
          console.error(`Error decoding JWT token`, e);
          this.accessLevel = AccessLevel.Restricted;
        }
        break;
      case 'transmart':
        this.accessLevel = AccessLevel.Full;
        break;
      default:
        throw new Error(`Unsupported authentication service type: ${serviceType}`);
    }
  }

  public load(): Promise<AuthorizationResult> {
    this.config = this.injector.get(AppConfig);
    this.authenticationMethod = this.injector.get(Oauth2Authentication);
    return this.authenticationMethod.load().then((result: AuthorizationResult) => {
      if (result === AuthorizationResult.Authorized) {
        this.readAccessLevelFromToken()
      }
      return result;
    });
  }

  ngOnDestroy(): void {
    this.authenticationMethod.onDestroy();
  }

  authorise(): Observable<AuthorizationResult> {
    return this.authenticationMethod.authorisation;
  }

  logout() {
    this.authenticationMethod.logout();
  }

  get authorised(): AsyncSubject<boolean> {
    return this.authenticationMethod.authorised;
  }

  get validToken(): boolean {
    return this.authenticationMethod.validToken;
  }

  get token(): string {
    return this.authenticationMethod.token;
  }

  get accessLevel(): AccessLevel {
    return this._accessLevel;
  }

  set accessLevel(value: AccessLevel) {
    this._accessLevel = value;
  }
}
