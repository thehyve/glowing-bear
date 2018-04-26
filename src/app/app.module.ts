import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {routing} from './app.routing';
import {AppComponent} from './app.component';

import {GbDataSelectionModule} from './modules/gb-data-selection-module/gb-data-selection.module';
import {ResourceService} from './services/resource.service';
import {TreeNodeService} from './services/tree-node.service';
import {AppConfig} from './config/app.config';
import {IRCTEndPointService} from './services/irct/irct-endpoint.service';
import {IRCTResourceService} from './services/irct/irct-resource.service';
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

import {AuthModule} from 'angular-auth-oidc-client';
import {ApiHttpInterceptor} from './services/api-http-interceptor.service';
import {GbAutoLoginComponent} from './gb-auto-login.component';
import {AuthenticationService} from './services/authentication.service';

export function initConfigAndAuth(config: AppConfig, authService: AuthenticationService) {
  return () => config.load().then(() => authService.load());
}

@NgModule({
  declarations: [
    AppComponent,
    GbAutoLoginComponent
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
    IRCTEndPointService,
    IRCTResourceService,
    ConstraintService,
    QueryService,
    TableService,
    AppConfig,
    AuthenticationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfigAndAuth,
      deps: [AppConfig, AuthenticationService],
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
