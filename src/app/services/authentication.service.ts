/**
 * Copyright 2017 - 2018  The Hyve B.V.
 * Copyright 2020 - 2021  EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../config/app.config';
import {Observable, from} from 'rxjs';
import {KeycloakService} from 'keycloak-angular';

@Injectable()
export class AuthenticationService {

  static readonly MEDCO_NETWORK_ROLE = 'medco-network';
  static readonly MEDCO_EXPLORE_ROLE = 'medco-explore';
  static readonly MEDCO_GEN_ANNOTATIONS_ROLE = 'medco-genomic-annotations';
  static readonly MEDCO_SURVIVAL_ANALYSIS_ROLE = 'medco-survival-analysis';

  constructor(private config: AppConfig,
              private keycloakService: KeycloakService) { }

  /**
   * Init the keycloak service with proper parameters.
   */
  public load(): Promise<void> {
    return this.keycloakService.init({
      config: {
        url: this.config.getConfig('keycloak-url'),
        realm: this.config.getConfig('keycloak-realm'),
        clientId: this.config.getConfig('keycloak-client-id')
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: false,

      },
      enableBearerInterceptor: true,
      bearerPrefix: 'Bearer',
      bearerExcludedUrls: ['/assets', '/app'],
      loadUserProfileAtStartUp: true
    }).then((success) => new Promise((resolve, reject) => {
      if (!success || !this.hasMinimumRoles()) {
        console.error('Authentication or authorization failed. Roles: ', this.userRoles)
        alert('Authentication has failed or authorizations are insufficient. Please login with a different account or contact an administrator. You will now be logged out.')
        reject(this.logout);
      } else {
        resolve();
      }
    }))
  }

  /**
   * Returns true if the user has the minimum set of roles needed for the basic operation of MedCo.
   */
  public hasMinimumRoles(): boolean {
    return this.userRoles.includes(AuthenticationService.MEDCO_NETWORK_ROLE) &&
      this.userRoles.includes(AuthenticationService.MEDCO_EXPLORE_ROLE) &&
      this.userRoles.includes(AuthenticationService.MEDCO_GEN_ANNOTATIONS_ROLE);
  }

  /**
   * Returns true if the user has the authorization for analysis.
   */
  get hasAnalysisAuth(): boolean {
    return this.userRoles.includes(AuthenticationService.MEDCO_SURVIVAL_ANALYSIS_ROLE);
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
