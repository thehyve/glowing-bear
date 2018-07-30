/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MessageHelper} from '../utilities/message-helper';
import {ErrorHelper} from '../utilities/error-helper';

@Injectable()
export class AppConfig {

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
  public getConfig(key: any, defaultValue: any = null) {
    let value = this.config[key];
    return value != null ? value : defaultValue;
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
