import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routing';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";

import {EndpointService} from './modules/shared/services/endpoint.service';
import {DataSelectionModule} from "./modules/data-selection/data-selection.module";
import {AnalysisModule} from "./modules/analysis/analysis.module";
import {ExportModule} from "./modules/export/export.module";
import {DashboardModule} from "./modules/dashboard/dashboard.module";
import {WorkflowService} from "./modules/shared/services/workflow.service";
import {ResourceService} from "./modules/shared/services/resource.service";
import {DimensionRegistryService} from "./modules/shared/services/dimension-registry.service";
import {AppConfig} from "./config/app.config";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

export function initConfig(config: AppConfig){
  return () => config.load()
}

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    routing,
    DashboardModule,
    DataSelectionModule,
    AnalysisModule,
    ExportModule
  ],
  providers: [
    EndpointService,
    ResourceService,
    WorkflowService,
    DimensionRegistryService,
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
