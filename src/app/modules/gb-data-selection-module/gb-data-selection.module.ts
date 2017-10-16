import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {GbDataSelectionComponent} from './gb-data-selection.component';
import {routing} from './gb-data-selection.routing';
import {RouterModule} from '@angular/router';
import {GbSelectionComponent} from './accordion-components/gb-selection/gb-selection.component';
import {ObservationSelectionComponent} from './accordion-components/observation-selection/observation-selection.component';
import {GbStudyConstraintComponent} from './constraint-components/gb-study-constraint/gb-study-constraint.component';
import {GbCombinationConstraintComponent} from './constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';
import {GbConceptConstraintComponent} from './constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import {Md2AccordionModule} from 'md2';
import {CheckboxModule} from 'primeng/components/checkbox/checkbox';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import {MessagesModule, TreeModule, PanelModule, DataListModule, DataTableModule, TreeTableModule} from 'primeng/primeng';
import {GbExportComponent} from './accordion-components/gb-export/gb-export.component';
import {SimpleTimer} from 'ng2-simple-timer';
import {GbProjectionComponent} from './accordion-components/gb-projection/gb-projection.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    Md2AccordionModule,
    CheckboxModule,
    CalendarModule,
    MessagesModule,
    TreeModule,
    PanelModule,
    DataListModule,
    DataTableModule,
    TreeTableModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SimpleTimer
  ],
  declarations: [
    GbDataSelectionComponent,
    GbSelectionComponent,
    ObservationSelectionComponent,
    GbExportComponent,
    GbStudyConstraintComponent,
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbProjectionComponent
  ],
  entryComponents: [
    GbConstraintComponent,
    GbCombinationConstraintComponent,
    GbStudyConstraintComponent
  ]
})
export class GbDataSelectionModule {
}
