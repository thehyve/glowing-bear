/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbSidePanelComponent} from './gb-side-panel.component';
import {GbTreeNodesComponent} from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import {GbCohortsComponent} from './accordion-components/gb-cohorts/gb-cohorts.component';
import {
  AccordionModule,
  AutoCompleteModule,
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule, DataViewModule, DragDropModule,
  InputTextModule, OverlayPanelModule,
  PanelModule,
  RadioButtonModule,
  SelectButtonModule,
  ToggleButtonModule,
  TooltipModule, TreeDragDropService, TreeModule
} from 'primeng';
import {FormsModule} from '@angular/forms';
import {GbVariablesComponent} from './accordion-components/gb-variables/gb-variables.component';
import {
  GbCategorizedVariablesComponent
} from './accordion-components/gb-variables/gb-categorized-variables/gb-categorized-variables.component';
import {GbVariablesTreeComponent} from './accordion-components/gb-variables/gb-variables-tree/gb-variables-tree.component';
import {GbGenericModule} from '../gb-generic-module/gb-generic.module';
import {RouterModule} from '@angular/router';
import {GbTreeSearchComponent} from './accordion-components/gb-tree-search/gb-tree-search.component';
import {MatExpansionModule} from '@angular/material/expansion';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    TreeModule,
    OverlayPanelModule,
    DataViewModule,
    DragDropModule,
    FormsModule,
    AutoCompleteModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    RadioButtonModule,
    RouterModule,
    ToggleButtonModule,
    CheckboxModule,
    MatExpansionModule,
    SelectButtonModule,
    GbGenericModule
  ],
  declarations: [
    GbSidePanelComponent,
    GbTreeNodesComponent,
    GbCohortsComponent,
    GbVariablesComponent,
    GbCategorizedVariablesComponent,
    GbVariablesTreeComponent,
    GbTreeSearchComponent,
  ],
  providers: [TreeDragDropService, ConfirmationService],
  exports: [GbSidePanelComponent]
})
export class GbSidePanelModule {
}
