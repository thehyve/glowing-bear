/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {routing} from './app.routing';
import {AppComponent} from './app.component';

import {GbCohortSelectionModule} from './modules/gb-cohort-selection-module/gb-cohort-selection.module';
import {AppConfig} from './config/app.config';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GbSidePanelModule} from './modules/gb-side-panel-module/gb-side-panel.module';
import {GbNavBarModule} from './modules/gb-navbar-module/gb-navbar.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {GbExportModule} from './modules/gb-export-module/gb-export.module';
import {DatePipe} from '@angular/common';
import {GrowlModule} from 'primeng/growl';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {ApiHttpInterceptor} from './services/api-http-interceptor.service';
import {AuthenticationService} from './services/authentication/authentication.service';
import {Oauth2Authentication} from './services/authentication/oauth2-authentication';
import {GbMainModule} from './modules/gb-main-module/gb-main.module';

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
    GbCohortSelectionModule,
    GbAnalysisModule,
    GbSidePanelModule,
    GbExportModule
  ],
  providers: [
    DatePipe,
    AppConfig,
    AuthenticationService,
    Oauth2Authentication,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfigAndAuth,
      deps: [AppConfig, AuthenticationService, Oauth2Authentication],
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
