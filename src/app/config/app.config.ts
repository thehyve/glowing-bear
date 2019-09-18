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
const { version: appVersion } = require('../../../package.json');

@Injectable({
  providedIn: 'root',
})
export class AppConfig {

  public static DEFAULT_API_VERSION = 'v2';
  public static DEFAULT_DOC_URL = 'https://glowingbear.app';
  public static DEFAULT_ENABLE_FRACTALIS_ANALYSIS = false;
  public static DEFAULT_AUTOSAVE_SUBJECT_SETS = false;
  public static DEFAULT_SHOW_OBSERVATIONS_COUNTS = true;
  public static DEFAULT_INSTANT_COUNTS_UPDATE = false;
  public static DEFAULT_INCLUDE_DATA_TABLE = true;
  public static DEFAULT_INCLUDE_COHORT_SUBSCRIPTION = false;
  public static DEFAULT_AUTHENTICATION_SERVICE_TYPE = 'oidc';
  public static DEFAULT_OIDC_SERVER_URL =
    'https://keycloak-dwh-test.thehyve.net/auth/realms/transmart-dev/protocol/openid-connect';
  public static DEFAULT_OIDC_CLIENT_ID = 'transmart-client';
  public static DEFAULT_EXPORT_MODE = {
    'name': 'transmart',
    'data-view': 'dataTable'
  };
  public static DEFAULT_CHECK_SERVER_STATUS = false;

  static path = 'app/config/';
  config: Object = null;
  env: Object = null;
  configError: string = null;
  validConfig: boolean = null;

  constructor(public http: HttpClient) {
  }

  get version() {
    return appVersion;
  }

  /**
   * Use to get the data found in the second file (config file)
   * if present; returns default value otherwise.
   */
  public getConfig(key: any) {
    let value = this.config[key];
    if (value !== null && value !== undefined) {
      return value;
    }
    switch (key) {
      case 'api-url': {
        throw Error('The API URL is unspecified in the configuration.')
      }
      case 'api-version': {
        return AppConfig.DEFAULT_API_VERSION;
      }
      case 'gb-backend-url': {
        throw Error('Gb-backend URL is unspecified in the configuration.')
      }
      case 'fractalis-url': {
        if (this.getConfig('enable-fractalis-analysis') === true) {
          throw Error('Fractalis URL is unspecified in the configuration.')
        }
        return null;
      }
      case 'fractalis-datasource-url': {
        // Use the API URL by default.
        return this.getConfig('api-url');
      }
      case 'doc-url': {
        return AppConfig.DEFAULT_DOC_URL;
      }
      case 'enable-fractalis-analysis': {
        return AppConfig.DEFAULT_ENABLE_FRACTALIS_ANALYSIS;
      }
      case 'autosave-subject-sets': {
        return AppConfig.DEFAULT_AUTOSAVE_SUBJECT_SETS;
      }
      case 'show-observation-counts': {
        return AppConfig.DEFAULT_SHOW_OBSERVATIONS_COUNTS;
      }
      case 'instant-counts-update': {
        return AppConfig.DEFAULT_INSTANT_COUNTS_UPDATE;
      }
      case 'include-data-table': {
        return AppConfig.DEFAULT_INCLUDE_DATA_TABLE;
      }
      case 'include-cohort-subscription': {
        return AppConfig.DEFAULT_INCLUDE_COHORT_SUBSCRIPTION;
      }
      case 'authentication-service-type': {
        return AppConfig.DEFAULT_AUTHENTICATION_SERVICE_TYPE;
      }
      case 'oidc-server-url': {
        return AppConfig.DEFAULT_OIDC_SERVER_URL;
      }
      case 'oidc-client-id': {
        return AppConfig.DEFAULT_OIDC_CLIENT_ID;
      }
      case 'export-mode': {
        return AppConfig.DEFAULT_EXPORT_MODE;
      }
      case 'check-server-status': {
        return AppConfig.DEFAULT_CHECK_SERVER_STATUS;
      }
      default: {
        return null;
      }
    }
  }

  /**
   * Use to get the data found in the first file (env file)
   */
  public getEnv() {
    return this.env['env'];
  }

  private checkConfig() {
    for (let key of ['api-url', 'gb-backend-url']) {
      try {
        this.getConfig(key);
      } catch (e) {
        this.configError = e.message;
        this.validConfig = false;
      }
    }
    this.validConfig = true;
  }

  get isLoaded(): boolean {
    return this.config && !this.configError && this.validConfig;
  }

  public load(): Promise<void> {
    return new Promise((resolve, reject) => {

      const options = {
        headers: new HttpHeaders({
          'Accept': 'application/json'
        })
      };
      this.http
        .get(AppConfig.path + 'env.json', options)
        .subscribe((envResponse) => {
          this.env = envResponse;
          const envString = this.getEnv();
          const configLocation = `${AppConfig.path}config.${envString}.json`;
          const request = this.http.get(configLocation, options);
          if (request) {
            request
              .subscribe((responseData) => {
                this.config = responseData;
                console.log('Successfully retrieved config: ', this.config);
                this.checkConfig();
                resolve();
              }, (err) => {
                ErrorHelper.handleError(err);
                this.configError = `Error reading configuration file: ${configLocation}`;
                reject();
              });
          } else {
            this.configError = 'Env config file "env.json" is invalid.';
            reject();
          }
        }, (err) => {
          ErrorHelper.handleError(err);
          this.configError = 'Configuration environment could not be read.';
          reject();
        });
    });
  }
}
