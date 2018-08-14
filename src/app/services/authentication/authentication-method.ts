/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Observable, AsyncSubject} from 'rxjs';
import {AuthorizationResult} from './authorization-result';

export interface AuthenticationMethod {

  /**
   * If true, a token is available.
   */
  authorised: AsyncSubject<boolean>;

  /**
   * Tries to authorise the current user and returns 'authorized' if successful.
   * Success means that a valid token is available.
   */
  authorisation: Observable<AuthorizationResult>;

  /**
   * Returns true if there is a valid token.
   */
  validToken: boolean;

  /**
   * The token to be used in request to the resource server.
   */
  token: string;

  /**
   * Initialise the authentication provider.
   * @return {Promise<AuthorizationResult>} 'authorized' if the user is succesfully
   * authorised after initialisation.
   */
  load(): Promise<AuthorizationResult>;

  /**
   * Clean up the provider state before shutdown.
   */
  onDestroy(): void;

  /**
   * Logout the user.
   */
  logout(): void;

}
