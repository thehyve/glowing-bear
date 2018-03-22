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
import {GbNavBarModule} from './modules/gb-nav-bar-module/gb-nav-bar.module';
import {GbAnalysisModule} from './modules/gb-analysis-module/gb-analysis.module';
import {GbDashboardModule} from './modules/gb-dashboard-module/gb-dashboard.module';
import {QueryService} from './services/query.service';
import {TableService} from './services/table.service';
import {ResourceHelperService} from './services/resource-helper.service';
import {HttpClientModule} from '@angular/common/http';
import {TransmartResourceService} from './services/transmart-services/transmart-resource.service';


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
    routing,
    GbNavBarModule,
    GbDashboardModule,
    GbDataSelectionModule,
    GbAnalysisModule,
    GbSidePanelModule
  ],
  providers: [
    EndpointService,
    ResourceService,
    ResourceHelperService,
    TransmartResourceService,
    TreeNodeService,
    ConstraintService,
    QueryService,
    TableService,
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
