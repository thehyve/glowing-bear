import {Injectable, Injector, OnDestroy} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable} from 'rxjs/Observable';
import {AuthenticationMethod} from './authentication-method';
import {OidcAuthentication} from './oidc-authentication';
import {Oauth2Authentication} from './oauth2-authentication';
import {AuthorisationResult} from './authorisation-result';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AuthenticationService implements OnDestroy {

  private config: AppConfig;
  private authenticationMethod: AuthenticationMethod;

  constructor(private injector: Injector) { }

  public load(): Promise<AuthorisationResult> {
    this.config = this.injector.get(AppConfig);
    let method = this.config.getConfig('authentication-method', 'oidc');
    switch (method) {
      case 'oidc':
        this.authenticationMethod = this.injector.get(OidcAuthentication);
        break;
      case 'oauth2':
        this.authenticationMethod = this.injector.get(Oauth2Authentication);
        break;
      default:
        throw new Error(`Unsupported authentication method: ${method}`);
    }
    return this.authenticationMethod.load();
  }

  ngOnDestroy(): void {
    this.authenticationMethod.onDestroy();
  }

  authorise(): Observable<AuthorisationResult> {
    return this.authenticationMethod.authorisation;
  }

  logout() {
    this.authenticationMethod.logout();
  }

  get authorised(): BehaviorSubject<boolean> {
    return this.authenticationMethod.authorised;
  }

  get validToken(): boolean {
    return this.authenticationMethod.validToken;
  }

  get token(): string {
    return this.authenticationMethod.token;
  }

}
