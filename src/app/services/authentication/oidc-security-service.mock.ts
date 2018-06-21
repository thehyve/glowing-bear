import {AuthorizationResult, AuthWellKnownEndpoints, OpenIDImplicitFlowConfiguration} from 'angular-auth-oidc-client';
import {EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';

export class OidcSecurityServiceMock {

  private _authorisationEvent = new EventEmitter<AuthorizationResult>();
  private _result = AuthorizationResult.unauthorized;
  private _token: string = null;

  authorizedCallback(): void {
    this._result = AuthorizationResult.authorized;
    this._token = 'XYZ';
    this._authorisationEvent.emit(this._result);
  }

  get onAuthorizationResult(): EventEmitter<AuthorizationResult> {
    return this._authorisationEvent;
  }

  getIsAuthorized(): Observable<boolean> {
    return Observable.of(this._result === AuthorizationResult.authorized);
  }

  getToken(): string {
    return this._token;
  }

  authorize(): void { }

  get moduleSetup(): boolean {
    return true;
  }

  setupModule(openIDImplicitFlowConfiguration: OpenIDImplicitFlowConfiguration,
              authWellKnownEndpoints: AuthWellKnownEndpoints): void { }

  logoff(): void {

  }

}
