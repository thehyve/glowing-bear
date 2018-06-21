import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../config/app.config';
import {AuthenticationService} from './authentication/authentication.service';
import {AuthorisationResult} from './authentication/authorisation-result';

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
          !req.url.includes(this.appConfig.getConfig('api-url')) ||
          req.url.endsWith('/oauth/token') ||
          req.url.endsWith('/oauth/inspectToken')
    ) {
      return next.handle(req);
    }

    // API request: wait for authorization
    return this.authenticationService.authorised.switchMap((isAuthorized) => {
      if (isAuthorized && this.authenticationService.validToken) {
        return next.handle(this.addAPIHeaders(req));
      } else {
        return this.authenticationService.authorise().switchMap((authResult: AuthorisationResult) => {
          if (authResult !== 'authorized') {
            throw new Error('Not authorized');
          }
          return next.handle(this.addAPIHeaders(req));
        });
      }
    });
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
