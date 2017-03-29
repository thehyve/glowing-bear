import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routes';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./navbar/navbar.component";
import {DashboardComponent} from "./dashboard/dashboard.component";
import { DataSelectionComponent } from './data-selection/data-selection.component';
import { AnalysisComponent } from './analysis/analysis.component';
import { ExportComponent } from './export/export.component';

import { EndpointService } from './services/endpoint.service';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    DataSelectionComponent,
    AnalysisComponent,
    ExportComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [
    EndpointService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
