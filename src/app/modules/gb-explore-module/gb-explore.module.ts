/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbExploreComponent} from './gb-explore.component';
import {routing} from './gb-explore.routing';
import {AccordionModule} from 'primeng/components/accordion/accordion';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {RouterModule} from '@angular/router';
import {GbCombinationConstraintComponent} from './constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';
import {GbConceptConstraintComponent} from './constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import {GbGenomicAnnotationConstraintComponent} from './constraint-components/gb-genomic-annotation-constraint/gb-genomic-annotation-constraint.component';
import {GbSelectionComponent} from './gb-selection-component/gb-selection.component';

import {FormsModule} from '@angular/forms';
import {AutoCompleteModule} from 'primeng/autocomplete';
import {CheckboxModule} from 'primeng/checkbox';
import {CalendarModule} from 'primeng/calendar';
import {PanelModule} from 'primeng/panel';
import {MultiSelectModule} from 'primeng/multiselect';
import {GbSelectionModule} from './gb-selection-component/gb-selection.module';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    OverlayPanelModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    CheckboxModule,
    CalendarModule,
    PanelModule,
    MultiSelectModule,
    GbSelectionModule
  ],
  exports: [
    RouterModule,

  ],
  declarations: [
    GbExploreComponent
  ],
  entryComponents: [
    GbConstraintComponent,
    GbCombinationConstraintComponent
  ]
})
export class GbExploreModule {
}
