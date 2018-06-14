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
