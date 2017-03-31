import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routing';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";


import {EndpointService} from './services/endpoint.service';
import {DataSelectionModule} from "./modules/data-selection/data-selection.module";
import {AnalysisModule} from "./modules/analysis/analysis.module";
import {ExportModule} from "./modules/export/export.module";
import {DashboardModule} from "./modules/dashboard/dashboard.module";



@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing,
    DashboardModule,
    DataSelectionModule,
    AnalysisModule,
    ExportModule
  ],
  providers: [
    EndpointService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
