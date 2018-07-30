/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import * as moment from 'moment';

export class Oauth2Token {
  accessToken: string;
  refreshToken: string;
  expires: Date;

  static from(object: object): Oauth2Token {
    return {
      accessToken: object['access_token'],
      refreshToken: object['refresh_token'],
      expires: moment(Date.now()).add(object['expires_in'] as number, 'seconds').toDate()
    }
  }
}
