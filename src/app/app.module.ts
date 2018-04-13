import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {routing} from './app.routing';
import {AppComponent} from './app.component';

import {GbDataSelectionModule} from './modules/gb-data-selection-module/gb-data-selection.module';
import {ResourceService} from './services/resource.service';
import {TreeNodeService} from './services/tree-node.service';
import {AppConfig} from './config/app.config';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConstraintService} from './services/constraint.service';
import {GbSidePanelModule} from './modules/gb-side-panel-module/gb-side-panel.module';
import {GbNavBarModule} from './modules/gb-nav-bar-module/gb-nav-bar.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {GbDashboardModule} from './modules/gb-dashboard-module/gb-dashboard.module';
import {QueryService} from './services/query.service';
import {TableService} from './services/table.service';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {TransmartResourceService} from './services/transmart-resource/transmart-resource.service';

import {
  AuthModule,
  OidcSecurityService,
  OpenIDImplicitFlowConfiguration,
  OidcConfigService,
  AuthWellKnownEndpoints
} from 'angular-auth-oidc-client';
import {HttpHeadersInterceptor} from './utilities/HttpHeadersInterceptor';
import {AutoLoginComponent} from './auto-login.component';
import {IRCTEndPointService} from './services/irct/irct-endpoint.service';
import {IRCTResourceService} from './services/irct/irct-resource.service';

export function initConfig(config: AppConfig, oidcConfigService: OidcConfigService) {
  return () => config.load().then(() =>
    oidcConfigService.load_using_stsServer(config.getConfig('idp-url'))
  );
}

@NgModule({
  declarations: [
    AppComponent,
    AutoLoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    routing,
    GbNavBarModule,
    GbDashboardModule,
    GbDataSelectionModule,
    GbAnalysisModule,
    GbSidePanelModule,
    AuthModule.forRoot()
  ],
  providers: [
    ResourceService,
    TransmartResourceService,
    TreeNodeService,
    ConstraintService,
    QueryService,
    TableService,
    AppConfig,
    OidcConfigService,
    OidcSecurityService,
    IRCTEndPointService,
    IRCTResourceService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfig, OidcConfigService],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpHeadersInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

  constructor(private config: AppConfig,
              private oidcSecurityService: OidcSecurityService,
              private oidcConfigService: OidcConfigService) {

    // load oidc configuration
    this.oidcConfigService.onConfigurationLoaded.subscribe(() => {

      // oidc implicit flow configuration
      const openIDImplicitFlowConfiguration = new OpenIDImplicitFlowConfiguration();
      openIDImplicitFlowConfiguration.stsServer = this.config.getConfig('idp-url');
      openIDImplicitFlowConfiguration.redirect_url = this.config.getConfig('app-url');
      openIDImplicitFlowConfiguration.client_id = this.config.getConfig('oidc-client-id');
      openIDImplicitFlowConfiguration.response_type = 'id_token token';
      openIDImplicitFlowConfiguration.scope = this.config.getConfig('oidc-scopes');
      openIDImplicitFlowConfiguration.post_logout_redirect_uri = this.config.getConfig('app-url');
      openIDImplicitFlowConfiguration.start_checksession = false;
      openIDImplicitFlowConfiguration.silent_renew = false;
      openIDImplicitFlowConfiguration.post_login_route = '/';
      openIDImplicitFlowConfiguration.log_console_warning_active = true;
      openIDImplicitFlowConfiguration.log_console_debug_active = !this.config.getEnv('production');
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
  }
}
