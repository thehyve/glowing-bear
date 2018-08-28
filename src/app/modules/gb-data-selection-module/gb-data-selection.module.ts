/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
  MessagesModule, PickListModule, PaginatorModule, MultiSelectModule, OverlayPanelModule
} from 'primeng/primeng';
import {GbProjectionComponent} from './accordion-components/gb-projection/gb-projection.component';
import {GbSubjectSetConstraintComponent} from './constraint-components/gb-subject-set-constraint/gb-subject-set-constraint.component';
import {GbPedigreeConstraintComponent} from './constraint-components/gb-pedigree-constraint/gb-pedigree-constraint.component';
import {GbDataTableComponent} from './accordion-components/gb-data-table/gb-data-table.component';
import {GbDataTableDimensionsComponent} from './data-table-components/gb-data-table-dimensions/gb-data-table-dimensions.component';
import {GbDataTableGridComponent} from './data-table-components/gb-data-table-grid/gb-data-table-grid.component';
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
    MultiSelectModule,
    OverlayPanelModule
  ],
  exports: [
    RouterModule
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
    GbDataTableDimensionsComponent,
    GbDataTableGridComponent
  ],
  entryComponents: [
    GbConstraintComponent,
    GbCombinationConstraintComponent,
    GbStudyConstraintComponent
  ]
})
export class GbDataSelectionModule {
}
