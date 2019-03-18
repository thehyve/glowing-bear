/**
 * Copyright 2017 - 2019  The Hyve B.V.
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
import {Subject} from 'rxjs/Rx';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService implements OnDestroy {

  private config: AppConfig;
  private authenticationMethod: AuthenticationMethod;
  private _accessLevel: Subject<AccessLevel> = new AsyncSubject<AccessLevel>();

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

  constructor(private injector: Injector) {
  }

  /**
   * Parse the decoded token, determine the access level
   */
  private readAccessLevelFromToken() {
    let serviceType = this.config.getConfig('authentication-service-type');
    switch (serviceType) {
      case 'oidc': {
        const clientId = this.config.getConfig('oidc-client-id');
        try {
          let roles: string[] = [];
          let token = jwt_decode(this.token);
          if (token['resource_access']) {
            let clientAccess = token['resource_access'][clientId];
            if (clientAccess) {
              let clientAccessRoles = clientAccess['roles'];
              if (clientAccessRoles && clientAccessRoles.constructor === Array) {
                roles = clientAccessRoles;
              }
            }
          }
          const level = AuthenticationService.getAccessLevelFromRoles(roles);
          this.accessLevel.next(level);
          this.accessLevel.complete();
          console.log(`Access level: ${level}`);
          return;
        } catch (e) {
          console.error(`Error decoding JWT token`, e);
          this.accessLevel.next(AccessLevel.Restricted);
          this.accessLevel.complete();
        }
        return;
      }
      case 'transmart': {
        this.accessLevel.next(AccessLevel.Full);
        this.accessLevel.complete();
        return;
      }
      default: {
        const message = `Unsupported authentication service type: ${serviceType}`;
        this.accessLevel.error(message);
        throw new Error(message);
      }
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

  get accessLevel(): Subject<AccessLevel> {
    return this._accessLevel;
  }

  set accessLevel(value: Subject<AccessLevel>) {
    this._accessLevel = value;
  }
}
