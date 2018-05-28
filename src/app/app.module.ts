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
import {HttpClientModule} from '@angular/common/http';
import {TransmartResourceService} from './services/transmart-resource/transmart-resource.service';
import {CrossTableService} from './services/cross-table.service';
import {GbExportModule} from './modules/gb-export-module/gb-export.module';
import {NavbarService} from './services/navbar.service';
import {MessageService} from './services/message.service';
import {ExportService} from './services/export.service';
import {DatePipe} from '@angular/common';
import {GrowlModule} from 'primeng/growl';
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
    GrowlModule,
    routing,
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
    TreeNodeService,
    ConstraintService,
    QueryService,
    DataTableService,
    CrossTableService,
    NavbarService,
    MessageService,
    ExportService,
    DatePipe,
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
