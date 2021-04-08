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
import {AccordionModule} from 'primeng';
import {OverlayPanelModule} from 'primeng';
import {RouterModule} from '@angular/router';
import {GbCombinationConstraintComponent} from './constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import {GbConstraintComponent} from './constraint-components/gb-constraint/gb-constraint.component';

import {FormsModule} from '@angular/forms';
import {AutoCompleteModule} from 'primeng';
import {CheckboxModule} from 'primeng';
import {CalendarModule} from 'primeng';
import {PanelModule} from 'primeng';

import {MultiSelectModule} from 'primeng';
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
