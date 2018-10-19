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

import {GbDataSelectionModule} from './modules/gb-data-selection-module/gb-data-selection.module';
import {ResourceService} from './services/resource.service';
import {TreeNodeService} from './services/tree-node.service';
import {AppConfig} from './config/app.config';
import {PicSureResourceService} from './services/picsure-services/picsure-resource.service';
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

import {ApiHttpInterceptor} from './services/api-http-interceptor.service';
import {AuthenticationService} from './services/authentication/authentication.service';
import {Oauth2Authentication} from './services/authentication/oauth2-authentication';
import {GbMainModule} from './modules/gb-main-module/gb-main.module';
import {TransmartResourceService} from './services/transmart-services/transmart-resource.service';
import {AuthorizationResult} from './services/authentication/authorization-result';
import * as jwt_decode from 'jwt-decode';
import {AccessLevel} from './services/authentication/access-level';
import {ApiEndpointService} from './services/api-endpoint.service';
import {MedcoService} from './services/picsure-services/medco.service';
import {GbMedcoResultsModule} from "./modules/gb-medco-results-module/gb-medco-results.module";
import {GenomicAnnotationsService} from "./services/picsure-services/genomic-annotations.service";

export function initConfigAndAuth(config: AppConfig, authService: AuthenticationService) {
  return () => config.load()
    .then(() => {
      authService.load()
        .then((authResult: AuthorizationResult) => {
          /*
           * ------------------- start: if authorized -----------------------
           */
          if (authResult === AuthorizationResult.Authorized) {
            /*
             * Parse the decoded token, determine the access level
             * TODO: in future
             * 1. associate access level to showing data table;
             * 2. fetch client id programmatically (i.e. glowingbear-js)
             * 3. possibly create user service and user management
             */
            const clientId = config.getConfig('oidc-client-id', 'transmart-client');
            let token = jwt_decode(authService.token);
            if (token['resource_access']) {
              let glowingBearJs = token['resource_access'][clientId];
              if (glowingBearJs) {
                let roles = glowingBearJs['roles'];
                let str = '';
                if (roles && roles.constructor === Array && roles.length > 0) {
                  roles.forEach((role: string) => {
                    str += role + ' ';
                  });
                  authService.accessLevel = str.includes('COUNTS_WITH_THRESHOLD')
                    ? AccessLevel.Restricted : AccessLevel.Full;
                }
              }
            }
          }
          /*
           * ------------------- end: if authorized -----------------------
           */
        });
    });
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
    GbMedcoResultsModule,
    GbExportModule
  ],
  providers: [
    ApiEndpointService,
    ResourceService,
    TransmartResourceService,
    TreeNodeService,
    PicSureResourceService,
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
    MedcoService,
    GenomicAnnotationsService,
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
