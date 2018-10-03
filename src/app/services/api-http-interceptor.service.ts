/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {tap, switchMap} from 'rxjs/operators';
import {Injectable, Injector} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppConfig} from '../config/app.config';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthorizationResult} from './authentication/authorization-result';

@Injectable()
export class ApiHttpInterceptor implements HttpInterceptor {
  private authenticationService: AuthenticationService;
  private appConfig: AppConfig;

  constructor(private injector: Injector) { }

  /**
   * Intercept HTTP request to embed headers (token and content-type)
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.authenticationService === undefined) {
      this.authenticationService = this.injector.get(AuthenticationService);
    }
    if (this.appConfig === undefined) {
      this.appConfig = this.injector.get(AppConfig);
    }

    // skip if request is for config, or if not for API
    if (  req.url.includes(AppConfig.path) ||
          (!req.url.includes(this.appConfig.getConfig('api-url')) &&
          !req.url.includes(this.appConfig.getConfig('export-service-url'))) ||
          req.url.endsWith('/oauth/token')
    ) {
      return next.handle(req);
    }

    // API request: wait for authorization
    return this.authenticationService.authorised.pipe(switchMap((isAuthorized) => {
      if (isAuthorized && this.authenticationService.validToken) {
        return next.handle(this.addAPIHeaders(req));
      } else {
        return this.authenticationService.authorise().pipe(switchMap((authResult: AuthorizationResult) => {
          if (authResult !== AuthorizationResult.Authorized) {
            throw new Error('Not authorized');
          }
          return next.handle(this.addAPIHeaders(req)).pipe(tap(() => {}, (err: any) => {
            if (err instanceof HttpErrorResponse) {
              if (err.status === 401) {
                this.authenticationService.logout();
              }
            }
          }));
        }));
      }
    }));
  }

  private addAPIHeaders(req: HttpRequest<any>): HttpRequest<any> {
    let token = this.authenticationService.token;

    if (token !== '') {
      return req.clone({ setHeaders: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        } });
    } else {
      throw new Error('Token is null');
    }
  }

}
