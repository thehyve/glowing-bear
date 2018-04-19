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

import {AuthModule} from 'angular-auth-oidc-client';
import {IrctHttpInterceptor} from './services/irct/irct-http-interceptor.service';
import {AutoLoginComponent} from './auto-login.component';
import {AuthenticationService} from './services/authentication.service';

export function initConfigAndAuth(config: AppConfig, authService: AuthenticationService) {
  return () => config.load().then(() => authService.load());
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
    AuthenticationService,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfigAndAuth,
      deps: [AppConfig, AuthenticationService],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: IrctHttpInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
