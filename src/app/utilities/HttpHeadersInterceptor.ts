import {Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {OidcSecurityService} from 'angular-auth-oidc-client';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class HttpHeadersInterceptor implements HttpInterceptor {
  private oidcSecurityService: OidcSecurityService;

  constructor(private injector: Injector) { }

  /**
   * Intercept HTTP request to embed headers (token and content-type)
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.oidcSecurityService === undefined) {
      this.oidcSecurityService = this.injector.get(OidcSecurityService);
    }

    let requestToForward = req;
    let token = this.oidcSecurityService.getToken();
    if (token !== '') {
      requestToForward = req.clone({ setHeaders: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      } });
    } else {
      console.warn('Token is null!')
    }

    return next.handle(requestToForward);
  }
}
