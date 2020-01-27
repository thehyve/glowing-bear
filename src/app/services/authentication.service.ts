/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020  EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../config/app.config';
import {Observable, from} from 'rxjs';
import {KeycloakService} from "keycloak-angular";

@Injectable()
export class AuthenticationService {

  constructor(private config: AppConfig,
              private keycloakService: KeycloakService) { }

  /**
   * Init the keycloak service with proper parameters.
   */
  public load(): Promise<boolean> {
    return this.keycloakService.init({
      config: {
        url: this.config.getConfig('keycloak-url'),
        realm: this.config.getConfig('keycloak-realm'),
        clientId: this.config.getConfig('keycloak-client-id')
      },
      initOptions: {
        onLoad: "login-required",
        checkLoginIframe: false
      },
      enableBearerInterceptor: true,
      bearerPrefix: "Bearer",
      bearerExcludedUrls: ['/assets', '/app'],
      loadUserProfileAtStartUp: true
    })
  }

  /**
   * Get user roles.
   */
  get userRoles(): string[] {
    return this.keycloakService.getUserRoles(false);
  }

  /**
   * Get username.
   */
  get username(): string {
    return this.keycloakService.getUsername();
  }

  /**
   * Get if user is logged in.
   */
  get userLoggedIn(): Observable<boolean> {
    return from(this.keycloakService.isLoggedIn());
  }

  /**
   * Initiate logout.
   */
  get logout(): Promise<void> {
    return this.keycloakService.logout();
  }
}
