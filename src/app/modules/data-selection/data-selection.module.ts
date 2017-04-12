import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DataSelectionComponent} from "./data-selection.component";
import {routing} from './data-selection.routing';
import {RouterModule} from "@angular/router";
import {DataViewComponent} from './accordion-components/data-view/data-view.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {PatientSelectionComponent} from './accordion-components/patient-selection/patient-selection.component';
import {ObservationSelectionComponent} from './accordion-components/observation-selection/observation-selection.component';
import {DataSummaryComponent} from './accordion-components/data-summary/data-summary.component';
import { StudyConstraintComponent } from './constraint-components/study-constraint/study-constraint.component';

@NgModule({
  imports: [
    CommonModule,
    NgbModule,
    routing,
    FormsModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    DataSelectionComponent,
    DataViewComponent,
    PatientSelectionComponent,
    ObservationSelectionComponent,
    DataSummaryComponent,
    StudyConstraintComponent
  ]
})
export class DataSelectionModule {
}
