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
import {AccordionModule} from 'primeng/components/accordion/accordion';
import {TreeModule} from 'primeng/components/tree/tree';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {GbTreeNodesComponent} from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import {TreeDragDropService} from 'primeng/components/common/api';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {GbCohortsComponent} from './accordion-components/gb-cohorts/gb-cohorts.component';
import {DragDropModule} from 'primeng/components/dragdrop/dragdrop';
import {
  AutoCompleteModule,
  ButtonModule,
  CheckboxModule,
  ConfirmationService,
  ConfirmDialogModule,
  InputTextModule,
  PanelModule,
  RadioButtonModule,
  SelectButtonModule,
  ToggleButtonModule,
  TooltipModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {Md2AccordionModule} from 'md2';
import {GbVariablesComponent} from './accordion-components/gb-variables/gb-variables.component';
import {MatExpansionModule} from '@angular/material';
import {
  GbCategorizedVariablesComponent
} from './accordion-components/gb-variables/gb-categorized-variables/gb-categorized-variables.component';
import {GbVariablesTreeComponent} from './accordion-components/gb-variables/gb-variables-tree/gb-variables-tree.component';
import {GbGenericModule} from '../gb-generic-module/gb-generic.module';
import {RouterModule} from '@angular/router';
import {GbTreeSearchComponent} from './accordion-components/gb-tree-search/gb-tree-search.component';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    TreeModule,
    OverlayPanelModule,
    DataListModule,
    DragDropModule,
    FormsModule,
    AutoCompleteModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    Md2AccordionModule,
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
