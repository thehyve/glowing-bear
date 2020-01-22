/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable, from} from 'rxjs';
import {KeycloakService} from "keycloak-angular";

@Injectable()
export class AuthenticationService {

  // private config: AppConfig;
  // private authenticationMethod: AuthenticationMethod;

  constructor(private config: AppConfig, private keycloakService: KeycloakService) { }

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


    // this.config = this.injector.get(AppConfig);
    // this.authenticationMethod = this.injector.get(Oauth2Authentication);
    // return this.authenticationMethod.load();
  }

  // ngOnDestroy(): void {
  //   this.authenticationMethod.onDestroy();
  // }
  //
  // authorise(): Observable<AuthorizationResult> {
  //   return this.authenticationMethod.authorisation;
  // }
  //
  // logout() {
  //   this.authenticationMethod.logout();
  // }
  //
  // get authorised(): AsyncSubject<boolean> {
  //   this.keycloakService.
  //   return this.authenticationMethod.authorised;
  // }
  //
  // get validToken(): boolean {
  //   return this.authenticationMethod.validToken;
  // }
  //
  // get token(): string {
  //   return this.authenticationMethod.token;
  // }
  //

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
