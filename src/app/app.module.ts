import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routing';
import {AppComponent} from './app.component';

import {EndpointService} from './services/endpoint.service';
import {DataSelectionModule} from './modules/data-selection/data-selection.module';
import {AnalysisModule} from './modules/analysis/analysis.module';
import {ExportModule} from './modules/export/export.module';
import {DashboardModule} from './modules/dashboard/dashboard.module';
import {ResourceService} from './services/resource.service';
import {DimensionRegistryService} from './services/dimension-registry.service';
import {AppConfig} from './config/app.config';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ConstraintService} from './services/constraint.service';
import {SidePanelModule} from './modules/side-panel/side-panel.module';
import {NavBarModule} from './modules/nav-bar/nav-bar.module';

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
    HttpModule,
    BrowserAnimationsModule,
    routing,
    NavBarModule,
    DashboardModule,
    DataSelectionModule,
    AnalysisModule,
    ExportModule,
    SidePanelModule
  ],
  providers: [
    EndpointService,
    ResourceService,
    DimensionRegistryService,
    ConstraintService,
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
