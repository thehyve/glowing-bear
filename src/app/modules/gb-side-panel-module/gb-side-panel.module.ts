/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GbSidePanelComponent } from './gb-side-panel.component';
import { AccordionModule } from 'primeng/components/accordion/accordion';
import { TreeModule } from 'primeng/components/tree/tree';
import { DataListModule } from 'primeng/components/datalist/datalist';
import { GbTreeNodesComponent } from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import { ConfirmationService, TreeDragDropService } from 'primeng/components/common/api';
import { OverlayPanelModule } from 'primeng/components/overlaypanel/overlaypanel';
import { DragDropModule } from 'primeng/components/dragdrop/dragdrop';
import { FormsModule } from '@angular/forms';
import { GbSummaryComponent } from './accordion-components/gb-summary/gb-summary.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { RadioButtonModule } from 'primeng/radiobutton';
import { GbCohortsComponent } from './accordion-components/gb-cohorts/gb-cohorts.component';

import { ToggleButtonModule } from 'primeng/togglebutton'
import { ExploreCohortsService } from 'app/services/api/medco-node/explore-cohorts.service';
import { SurvivalService } from 'app/services/survival-analysis.service';


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
    ToggleButtonModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    RadioButtonModule,
  ],
  declarations: [
    GbSidePanelComponent,
    GbTreeNodesComponent,
    GbSummaryComponent,
    GbCohortsComponent
  ],
  providers: [TreeDragDropService, ConfirmationService, SurvivalService, ExploreCohortsService],
  exports: [GbSidePanelComponent]
})
export class GbSidePanelModule {
}
