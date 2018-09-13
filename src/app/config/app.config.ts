/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';

@Injectable()
export class AppConfig {

  public static DEFAULT_API_VERSION = 'v2';
  public static DEFAULT_APP_URL = 'http://localhost:4200';
  public static DEFAULT_APP_VERSION = 'unspecified';
  public static DEFAULT_DOC_URL = 'https://glowingbear.app';
  public static DEFAULT_AUTOSAVE_SUBJECT_SETS = false;
  public static DEFAULT_EXPORT_DATA_VIEW = 'dataTable';
  public static DEFAULT_SHOW_OBSERVATIONS_COUNTS = true;
  public static DEFAULT_INSTANT_COUNTS_UPDATE_1 = false;
  public static DEFAULT_INSTANT_COUNTS_UPDATE_2 = false;
  public static DEFAULT_INSTANT_COUNTS_UPDATE_3 = false;
  public static DEFAULT_INCLUDE_DATA_TABLE = true;
  public static DEFAULT_INCLUDE_QUERY_SUBSCRIPTION = false;
  public static DEFAULT_AUTHENTICATION_SERVICE_TYPE = 'oidc';
  public static DEFAULT_OIDC_SERVER_URL =
    'https://keycloak-dwh-test.thehyve.net/auth/realms/transmart-dev/protocol/openid-connect';
  public static DEFAULT_OIDC_CLIENT_ID = 'transmart-client';

  static path = 'app/config/';
  config: Object = null;
  env: Object = null;
  envs: Array<string> = null;

  // see this gist: https://gist.github.com/fernandohu/122e88c3bcd210bbe41c608c36306db9
  constructor(public http: HttpClient) {
    this.envs = ['default', 'dev', 'transmart'];
  }

  /**
   * Use to get the data found in the second file (config file)
   * if present; returns default value otherwise.
   */
  public getConfig(key: any) {
    let value = this.config[key];
    if (value === null || value === undefined) {
      switch (key) {
        case 'api-url': {
          throw Error('The API URL is unspecified in the configuration.')
        }
        case 'api-version': {
          value = AppConfig.DEFAULT_API_VERSION; break;
        }
        case 'app-url': {
          value = AppConfig.DEFAULT_APP_URL; break;
        }
        case 'app-version': {
          value = AppConfig.DEFAULT_APP_VERSION; break;
        }
        case 'doc-url': {
          value = AppConfig.DEFAULT_DOC_URL; break;
        }
        case 'autosave-subject-sets': {
          value = AppConfig.DEFAULT_AUTOSAVE_SUBJECT_SETS; break;
        }
        case 'export-data-view': {
          value = AppConfig.DEFAULT_EXPORT_DATA_VIEW; break;
        }
        case 'show-observation-counts': {
          value = AppConfig.DEFAULT_SHOW_OBSERVATIONS_COUNTS; break;
        }
        case 'instant-counts-update-1': {
          value = AppConfig.DEFAULT_INSTANT_COUNTS_UPDATE_1; break;
        }
        case 'instant-counts-update-2': {
          value = AppConfig.DEFAULT_INSTANT_COUNTS_UPDATE_2; break;
        }
        case 'instant-counts-update-3': {
          value = AppConfig.DEFAULT_INSTANT_COUNTS_UPDATE_3; break;
        }
        case 'include-data-table': {
          value = AppConfig.DEFAULT_INCLUDE_DATA_TABLE; break;
        }
        case 'include-query-subscription': {
          value = AppConfig.DEFAULT_INCLUDE_QUERY_SUBSCRIPTION; break;
        }
        case 'authentication-service-type': {
          value = AppConfig.DEFAULT_AUTHENTICATION_SERVICE_TYPE; break;
        }
        case 'oidc-server-url': {
          value = AppConfig.DEFAULT_OIDC_SERVER_URL; break;
        }
        case 'oidc-client-id': {
          value = AppConfig.DEFAULT_OIDC_CLIENT_ID; break;
        }
        default: {
          value = null; break;
        }
      }
    }
    return value;
  }

  /**
   * Use to get the data found in the first file (env file)
   */
  public getEnv() {
    return this.env['env'];
  }

  public load() {
    return new Promise((resolve, reject) => {

      const options = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      };
      this.http
        .get(AppConfig.path + 'env.json', options)
        .subscribe((envResponse) => {
          this.env = envResponse;
          const envString = this.getEnv();
          let request = this.envs.includes(envString) ?
            this.http.get(AppConfig.path + 'config.' + envString + '.json') : null;
          if (request) {
            request
              .subscribe((responseData) => {
                this.config = responseData;
                console.log('Successfully retrieved config: ', this.config);
                resolve(true);
              }, (err) => {
                ErrorHelper.handleError(err);
                const summary = 'Error reading ' + envString + ' configuration file';
                console.error(summary);
                resolve(err);
              });
          } else {
            const summary = 'Env config file "env.json" is  invalid';
            MessageHelper.alert('error', summary);
            console.error(summary);
            resolve(true);
          }
        }, (err) => {
          ErrorHelper.handleError(err);
          const summary = 'Configuration environment could not be read.';
          console.error(summary);
          resolve(err);
        });

    });
  }
}
