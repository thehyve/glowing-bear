import {Injectable, Injector, OnDestroy} from '@angular/core';
import {
  AuthorizationResult,
  AuthWellKnownEndpoints,
  OidcConfigService,
  OidcSecurityService,
  OpenIDImplicitFlowConfiguration
} from 'angular-auth-oidc-client';
import {AppConfig} from '../config/app.config';
import {Router} from '@angular/router';

@Injectable()
export class AuthenticationService implements OnDestroy {
  private config: AppConfig;
  private router: Router;
  private oidcSecurityService: OidcSecurityService;
  private oidcConfigService: OidcConfigService;

  constructor(private injector: Injector) { }

  public load() {

    // inject services (not in constructor to avoid cyclic dependency)
    this.oidcConfigService = this.injector.get(OidcConfigService);
    this.oidcSecurityService = this.injector.get(OidcSecurityService);
    this.config = this.injector.get(AppConfig);
    this.router = this.injector.get(Router);

    // load OIDC configuration from IDP
    this.oidcConfigService.load_using_stsServer(this.config.getConfig('oidc-server-url'));

    // load additional OIDC client configuration
    this.oidcConfigService.onConfigurationLoaded.subscribe(() => {

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
    });

    if (this.oidcSecurityService.moduleSetup) {
      this.onOidcModuleSetup();
    } else {
      this.oidcSecurityService.onModuleSetup.subscribe(() => {
        this.onOidcModuleSetup();
      });
    }

    this.oidcSecurityService.onAuthorizationResult.subscribe(
      (authorizationResult: AuthorizationResult) => {
        this.onAuthorizationResultComplete(authorizationResult);
      });
  }

  /**
   * Handles the callback from the IDP, or redirect to the IDP if not authorized.
   */
  private onOidcModuleSetup() {
    if (window.location.hash) {
      this.oidcSecurityService.authorizedCallback();
    } else {
      if ('/autologin' !== window.location.pathname) {
        localStorage.setItem('redirect', JSON.stringify(window.location.pathname));
      }

      this.oidcSecurityService.getIsAuthorized().subscribe((authorized: boolean) => {
        if (!authorized) {
          this.router.navigate(['/autologin']);
        }
      });
    }
  }

  /**
   * Redirect to the initially requested path after authorization is done.
   */
  private onAuthorizationResultComplete(authorizationResult: AuthorizationResult) {
    const path = JSON.parse(localStorage.getItem('redirect'));

    if (authorizationResult === AuthorizationResult.authorized) {
      this.router.navigate([path]);
    } else {
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy(): void {
    this.oidcSecurityService.onModuleSetup.unsubscribe();
  }

  logout() {
    this.oidcSecurityService.logoff();
  }
}
