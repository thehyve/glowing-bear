import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {DataSelectionComponent} from './data-selection.component';
import {routing} from './data-selection.routing';
import {RouterModule} from '@angular/router';
import {DataViewComponent} from './accordion-components/data-view/data-view.component';
import {PatientSelectionComponent} from './accordion-components/patient-selection/patient-selection.component';
import {ObservationSelectionComponent} from './accordion-components/observation-selection/observation-selection.component';
import {DataSummaryComponent} from './accordion-components/data-summary/data-summary.component';
import {StudyConstraintComponent} from './constraint-components/study-constraint/study-constraint.component';
import {CombinationConstraintComponent} from './constraint-components/combination-constraint/combination-constraint.component';
import {ConstraintComponent} from './constraint-components/constraint/constraint.component';
import {ConceptConstraintComponent} from './constraint-components/concept-constraint/concept-constraint.component';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import {Md2AccordionModule} from 'md2';
import {CheckboxModule} from 'primeng/components/checkbox/checkbox';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import {FileUploadModule, TreeModule} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    Md2AccordionModule,
    CheckboxModule,
    CalendarModule,
    TreeModule,
    FileUploadModule
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
    StudyConstraintComponent,
    CombinationConstraintComponent,
    ConstraintComponent,
    ConceptConstraintComponent
  ],
  entryComponents: [
    ConstraintComponent,
    CombinationConstraintComponent,
    StudyConstraintComponent
  ]
})
export class DataSelectionModule {
}
