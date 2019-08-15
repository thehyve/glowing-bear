/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as moment from 'moment';
import {JwtHelper} from "./jwt-helper";

export class Oauth2Token {
  accessToken: string;
  refreshToken: string;
  expires: Date;

  constructor(object: object) {
    this.accessToken = object['access_token'];
    this.refreshToken = object['refresh_token'];
    this.expires = moment(Date.now()).add(object['expires_in'] as number, 'seconds').toDate();
  }

  getAuthorisations(oidcClientId: string): string[] {
    let parsedToken = JwtHelper.decodeToken(this.accessToken);

    if (parsedToken['resource_access'] &&
        parsedToken['resource_access'][oidcClientId] &&
        parsedToken['resource_access'][oidcClientId]['roles']) {
      return parsedToken['resource_access'][oidcClientId]['roles'];
    }

    return undefined;
  }

}
