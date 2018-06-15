import {
  AuthWellKnownEndpoints, OidcConfigService,
  OidcSecurityService, OpenIDImplicitFlowConfiguration
} from 'angular-auth-oidc-client';
import {AppConfig} from '../../config/app.config';
import {Router} from '@angular/router';
import {Injectable, Injector} from '@angular/core';
import {AuthenticationMethod} from './authentication-method';
import {Observable} from 'rxjs/Observable';
import {AuthorisationResult} from './authorisation-result';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {MessageService} from '../message.service';

/**
 * Implementation of the OpenID Connect (OIDC) implicit flow,
 * based on the angular-auth-oidc-client library,
 * {@see https://github.com/damienbod/angular-auth-oidc-client}.
 * Summary of the flow:
 * - Receive configuration from the identity provider
 * - Redirect to login page
 * - Receive access token via URL redirect and validate token
 */
@Injectable()
export class OidcAuthentication implements AuthenticationMethod {

  private config: AppConfig;
  private router: Router;
  private messageService: MessageService;
  private oidcSecurityService: OidcSecurityService;
  private oidcConfigService: OidcConfigService;

  private _authorised: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  static isTokenRedirect(): boolean {
    return window.location.hash !== null && window.location.hash !== '';
  }

  constructor(private injector: Injector) { }

  private loadConfiguration() {
    console.log(`Load OIDC configuration ...`);
    // oidc implicit flow configuration
    const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
    openIDImplicitFlowConfiguration.stsServer = this.config.getConfig('oidc-server-url');
    openIDImplicitFlowConfiguration.redirect_url = this.config.getConfig('app-url');
    openIDImplicitFlowConfiguration.client_id = this.config.getConfig('oidc-client-id');
    openIDImplicitFlowConfiguration.response_type = 'id_token token';
    openIDImplicitFlowConfiguration.scope = this.config.getConfig('oidc-scopes');
    openIDImplicitFlowConfiguration.post_logout_redirect_uri = this.config.getConfig('app-url');
    openIDImplicitFlowConfiguration.start_checksession = false;
    openIDImplicitFlowConfiguration.silent_renew = false;
    openIDImplicitFlowConfiguration.post_login_route = '/';
    openIDImplicitFlowConfiguration.log_console_warning_active = true;
    openIDImplicitFlowConfiguration.log_console_debug_active = this.config.getEnv() === 'dev';
    openIDImplicitFlowConfiguration.max_id_token_iat_offset_allowed_in_seconds = 60;
    openIDImplicitFlowConfiguration.trigger_authorization_result_event = true;

    // todo: we probably want to add proper handling of HTTP 401/403
    openIDImplicitFlowConfiguration.forbidden_route = '/';
    openIDImplicitFlowConfiguration.unauthorized_route = '/';

    // oidc well known endpoints configuration (loaded in initConfig())
    const authWellKnownEndpoints = new AuthWellKnownEndpoints();
    authWellKnownEndpoints.setWellKnownEndpoints(this.oidcConfigService.wellKnownEndpoints);

    this.oidcSecurityService.setupModule(openIDImplicitFlowConfiguration, authWellKnownEndpoints);
  }

  /**
   * Redirect to the initially requested path after authorization is done.
   */
  private redirect(authorisation: AuthorisationResult) {
    if (authorisation === 'authorized') {
      const path = JSON.parse(localStorage.getItem('redirect'));
      console.log(`Redirect to ${path}`);
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/']);
    }
  }

  load(): Promise<AuthorisationResult> {
    console.log(`Load OIDC component ...`);
    // inject services (not in constructor to avoid cyclic dependency)
    this.config = this.injector.get(AppConfig);
    this.router = this.injector.get(Router);
    this.messageService = this.injector.get(MessageService);
    this.oidcConfigService = this.injector.get(OidcConfigService);
    this.oidcSecurityService = this.injector.get(OidcSecurityService);

    // load additional OIDC client configuration
    this.oidcConfigService.onConfigurationLoaded.subscribe(() =>
      this.loadConfiguration()
    );

    // load OIDC configuration from IDP
    this.oidcConfigService.load_using_stsServer(this.config.getConfig('oidc-server-url'));

    if (this.oidcSecurityService.moduleSetup) {
      return this.onOidcModuleSetup();
    } else {
      return new Promise<AuthorisationResult>(resolve =>
        this.oidcSecurityService.onModuleSetup.subscribe(() => {
          this.onOidcModuleSetup().then((result) =>
            resolve(result)
          )
        })
      );
    }
  }

  private requestToken(): Observable<AuthorisationResult> {
    console.log(`Redirecting to identity provider ...`);
    return Observable.fromPromise(new Promise((resolve) => {
      resolve('unauthorized');
      setTimeout(() => {
          this.oidcSecurityService.authorize();
        }, 2000
      );
    }));
  }

  /**
   * Handles the callback from the IDP, or redirect to the IDP if not authorized.
   */
  private onOidcModuleSetup(): Promise<AuthorisationResult> {
    if (OidcAuthentication.isTokenRedirect()) {
      console.log(`Token received from identity provider ...`);
      let promise = new Promise<AuthorisationResult>((resolve) => {
        this.oidcSecurityService.onAuthorizationResult.subscribe(() => {
          this.authorisation.subscribe((authorisation: AuthorisationResult) => {
            console.log(`Authorisation result: ${authorisation}`);
            this.redirect(authorisation);
            resolve(authorisation);
          });
        });
      });
      this.oidcSecurityService.authorizedCallback();
      return promise;
    } else {
      console.log(`Set redirect to: ${window.location.pathname}`);
      localStorage.setItem('redirect', JSON.stringify(window.location.pathname));
      return this.authorisation.toPromise();
    }
  }

  get authorised(): BehaviorSubject<boolean> {
    return this._authorised;
  }

  get authorisation(): Observable<AuthorisationResult> {
    return Observable.fromPromise(new Promise(resolve =>
      this.oidcSecurityService.getIsAuthorized().subscribe((result: boolean) => {
        if (result) {
          console.log(`Valid token available.`);
          this._authorised.next(true);
          resolve('authorized');
        } else {
          console.log(`No valid token found.`);
          this._authorised.next(false);
          return this.requestToken().subscribe((res) =>
            resolve(res)
          );
        }
      })
    ));
  }

  get validToken(): boolean {
    return this.oidcSecurityService.getToken() !== null;
  }

  get token(): string {
    return this.oidcSecurityService.getToken();
  }

  onDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  logout(): void {
    this.oidcSecurityService.logoff();
  }

}
