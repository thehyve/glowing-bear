import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';

import {routing} from './app.routes';
import {AppComponent} from './app.component';
import {NavbarComponent} from "./components/navbar/navbar.component";
import {DashboardComponent} from "./components/dashboard/dashboard.component";
import { DataSelectionComponent } from './components/data-selection/data-selection.component';
import { AnalysisComponent } from './components/analysis/analysis.component';
import { ExportComponent } from './components/export/export.component';

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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
