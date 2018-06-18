import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {routing} from './app.routing';
import {AppComponent} from './app.component';

import {EndpointService} from './services/endpoint.service';
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
import {TransmartResourceService} from './services/transmart-services/transmart-resource.service';
import {CrossTableService} from './services/cross-table.service';
import {GbExportModule} from './modules/gb-export-module/gb-export.module';
import {NavbarService} from './services/navbar.service';
import {ExportService} from './services/export.service';
import {DatePipe} from '@angular/common';
import {GrowlModule} from 'primeng/growl';

export function initConfig(config: AppConfig) {
  return () => config.load();
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
    GbNavBarModule,
    GbDataSelectionModule,
    GbAnalysisModule,
    GbSidePanelModule,
    GbExportModule
  ],
  providers: [
    EndpointService,
    ResourceService,
    TransmartResourceService,
    TreeNodeService,
    ConstraintService,
    QueryService,
    DataTableService,
    CrossTableService,
    NavbarService,
    ExportService,
    DatePipe,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [AppConfig],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
