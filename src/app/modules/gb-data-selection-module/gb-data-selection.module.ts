import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {GbDataSelectionComponent} from './gb-data-selection.component';
import {routing} from './gb-data-selection.routing';
import {RouterModule} from '@angular/router';
import {GbSelectionComponent} from './accordion-components/gb-selection/gb-selection.component';
import {GbStudyConstraintComponent} from './constraint-components/gb-study-constraint/gb-study-constraint.component';
import {GbCombinationConstraintComponent} from './constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';
import {GbConceptConstraintComponent} from './constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import {Md2AccordionModule} from 'md2';
import {CheckboxModule} from 'primeng/components/checkbox/checkbox';
import {CalendarModule} from 'primeng/components/calendar/calendar';
import {
  TreeModule,
  PanelModule,
  DataListModule,
  TreeTableModule,
  DropdownModule,
  TooltipModule,
  MessagesModule, PickListModule, PaginatorModule
} from 'primeng/primeng';
import {SimpleTimer} from 'ng2-simple-timer';
import {GbProjectionComponent} from './accordion-components/gb-projection/gb-projection.component';
import {GbSubjectSetConstraintComponent} from './constraint-components/gb-subject-set-constraint/gb-subject-set-constraint.component';
import {GbPedigreeConstraintComponent} from './constraint-components/gb-pedigree-constraint/gb-pedigree-constraint.component';
import {GbDataTableComponent} from './accordion-components/gb-data-table/gb-data-table.component';
import {GbTableDimensionsComponent} from './table-components/gb-table-dimensions/gb-table-dimensions.component';
import {GbTableGridComponent} from './table-components/gb-table-grid/gb-table-grid.component';
import {TableModule} from 'primeng/table';

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
    PanelModule,
    DataListModule,
    TreeTableModule,
    TableModule,
    PaginatorModule,
    DropdownModule,
    TooltipModule,
    MessagesModule,
    PickListModule,
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
    GbStudyConstraintComponent,
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbProjectionComponent,
    GbSubjectSetConstraintComponent,
    GbPedigreeConstraintComponent,
    GbDataTableComponent,
    GbTableDimensionsComponent,
    GbTableGridComponent
  ],
  entryComponents: [
    GbConstraintComponent,
    GbCombinationConstraintComponent,
    GbStudyConstraintComponent
  ]
})
export class GbDataSelectionModule {
}
