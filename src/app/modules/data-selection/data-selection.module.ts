import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {DataSelectionComponent} from "./data-selection.component";
import {routing} from './data-selection.routing';
import {RouterModule} from "@angular/router";
import {QueryComponent} from "./components/query/query.component";
import {DataViewComponent} from './components/data-view/data-view.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    DataSelectionComponent,
    QueryComponent,
    DataViewComponent
  ]
})
export class DataSelectionModule {
}
