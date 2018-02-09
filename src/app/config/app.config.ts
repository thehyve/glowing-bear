import {Injectable} from '@angular/core';
import {Http, Headers} from '@angular/http';
import {Observable} from 'rxjs/Rx';
import {environment} from '../../environments/environment';

@Injectable()
export class AppConfig {

  private config: Object = null;
  private env: Object = null;

  // see this gist: https://gist.github.com/fernandohu/122e88c3bcd210bbe41c608c36306db9
  constructor(private http: Http) {
  }

  /**
   * Use to get the data found in the second file (config file)
   */
  public getConfig(key: any) {
    return this.config[key];
  }

  /**
   * Use to get the data found in the first file (env file)
   */
  public getEnv(key: any) {
    return this.env[key];
  }

  /**
   * This method:
   *   a) Loads "env.json" to get the current working environment (e.g.: 'production', 'development')
   *   b) Loads "config.[env].json" to get all env's variables (e.g.: 'config.development.json')
   */
  public load() {
    return new Promise((resolve, reject) => {

      let headers = new Headers();
      headers.append('Content-Type', 'application/json');

      let path = 'app/config/';
      let envFilename = environment.production ? 'env.prod.json' : 'env.json';

      this.http
        .get(`${path}${envFilename}`, {
          headers: headers
        })
        .map(res => res.json())
        .catch((error: any): any => {
          console.error(`Configuration file "${envFilename}" could not be read`);
          resolve(true);
          return Observable.throw(error.json().error || 'Server error');
        })
        .subscribe((envResponse) => {
          this.env = envResponse;
          let request: any = null;
          let environment: string = this.getEnv('env');

          switch (environment) {
            case 'prod':
            case 'dev':
              request = this.http.get(`${path}config.${environment}.json`);
              break;
            case 'default':
              console.error('Environment file is not set or invalid');
              resolve(true);
              break;
          }

          if (request) {
            request
              .map(res => res.json())
              .catch((error: any) => {
                console.error(`Error reading ${environment} configuration file`);
                resolve(error);
                return Observable.throw(error.json().error || 'Server error');
              })
              .subscribe((responseData) => {
                this.config = responseData;
                console.log('Successfully retrieved config: ', this.config);
                resolve(true);
              });
          } else {
            console.error(`Env config file "${envFilename}" is not valid`);
            resolve(true);
          }
        });

    });
  }
}
