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
import {GbNavBarModule} from './modules/gb-navbar-module/gb-navbar.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {QueryService} from './services/query.service';
import {DataTableService} from './services/data-table.service';
import {CrossTableService} from './services/cross-table.service';
import {GbExportModule} from './modules/gb-export-module/gb-export.module';
import {NavbarService} from './services/navbar.service';
import {ExportService} from './services/export.service';
import {DatePipe} from '@angular/common';
import {GrowlModule} from 'primeng/growl';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {AuthModule} from 'angular-auth-oidc-client';
import {ApiHttpInterceptor} from './services/api-http-interceptor.service';
import {AuthenticationService} from './services/authentication/authentication.service';
import {Oauth2Authentication} from './services/authentication/oauth2-authentication';
import {OidcAuthentication} from './services/authentication/oidc-authentication';
import {GbMainModule} from './modules/gb-main-module/gb-main.module';
import {TransmartResourceService} from './services/transmart-services/transmart-resource.service';
import {TransmartStudiesService} from './services/transmart-services/transmart-studies.service';

export function initConfigAndAuth(config: AppConfig, authService: AuthenticationService) {
  return () => config.load().then(() => authService.load());
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    GrowlModule,
    routing,
    GbMainModule,
    GbNavBarModule,
    GbDataSelectionModule,
    GbAnalysisModule,
    GbSidePanelModule,
    GbExportModule,
    AuthModule.forRoot()
  ],
  providers: [
    ResourceService,
    TransmartResourceService,
    TransmartStudiesService,
    TreeNodeService,
    ConstraintService,
    QueryService,
    DataTableService,
    CrossTableService,
    NavbarService,
    ExportService,
    DatePipe,
    AppConfig,
    AuthenticationService,
    Oauth2Authentication,
    OidcAuthentication,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfigAndAuth,
      deps: [AppConfig, AuthenticationService, Oauth2Authentication, OidcAuthentication],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
