import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {AuthorizationResult, OidcSecurityService} from 'angular-auth-oidc-client';
import {Observable} from 'rxjs/Observable';
import {AppConfig} from '../../config/app.config';

@Injectable()
export class IrctHttpInterceptor implements HttpInterceptor {
  private oidcSecurityService: OidcSecurityService;
  private appConfig: AppConfig;

  constructor(private injector: Injector) { }

  /**
   * Intercept HTTP request to embed headers (token and content-type)
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.oidcSecurityService === undefined) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }
    if (this.appConfig === undefined) {
      this.appConfig = this.injector.get(AppConfig);
    }

    // skip if request is for config, or if not for IRCT
    if (  req.url.includes(AppConfig.path) ||
          !req.url.includes(this.appConfig.getConfig('api-url'))) {
      return next.handle(req);
    }

    // IRCT request: wait for oidc authorization
    return this.oidcSecurityService.getIsAuthorized().switchMap((isAuthorized) => {
      if (isAuthorized) {
        return next.handle(this.addIRCTHeaders(req));
      } else {
        return this.oidcSecurityService.onAuthorizationResult.asObservable().switchMap((authResult) => {
          if (authResult !== AuthorizationResult.authorized) {
            throw new Error('Not authorized');
          }
          return next.handle(this.addIRCTHeaders(req));
        });
      }
    });
  }

  private addIRCTHeaders(req: HttpRequest<any>): HttpRequest<any> {
    let token = this.oidcSecurityService.getToken();

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
