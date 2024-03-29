/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {GbCohortSelectionComponent} from './gb-cohort-selection.component';
import {routing} from './gb-cohort-selection.routing';
import {RouterModule} from '@angular/router';
import {GbStudyConstraintComponent} from './constraint-components/gb-study-constraint/gb-study-constraint.component';
import {GbCombinationConstraintComponent} from './constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';
import {GbConceptConstraintComponent} from './constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import {
  PanelModule,
  DataViewModule,
  TreeTableModule,
  DropdownModule,
  MessagesModule,
  PaginatorModule,
  MultiSelectModule,
  OverlayPanelModule,
  InputSwitchModule,
  AutoCompleteModule,
  CheckboxModule, CalendarModule
} from 'primeng';
import {GbSubjectSetConstraintComponent} from './constraint-components/gb-subject-set-constraint/gb-subject-set-constraint.component';
import {GbPedigreeConstraintComponent} from './constraint-components/gb-pedigree-constraint/gb-pedigree-constraint.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    CheckboxModule,
    CalendarModule,
    PanelModule,
    DataViewModule,
    TreeTableModule,
    PaginatorModule,
    DropdownModule,
    MessagesModule,
    MultiSelectModule,
    OverlayPanelModule,
    InputSwitchModule,
    DropdownModule,
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    GbCohortSelectionComponent,
    GbStudyConstraintComponent,
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbSubjectSetConstraintComponent,
    GbPedigreeConstraintComponent
  ],
})
export class GbCohortSelectionModule {
}
