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
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';
import {DragDropModule, OverlayPanelModule, SelectButtonModule} from 'primeng';
import {GbCrossTableComponent} from './cross-table-components/gb-cross-table/gb-cross-table.component';
import {GbDraggableCellComponent} from './cross-table-components/gb-draggable-cell/gb-draggable-cell.component';
import {GbDroppableZoneComponent} from './cross-table-components/gb-droppable-zone/gb-droppable-zone.component';
import {TableModule} from 'primeng/table';
import {GbFractalisControlComponent} from './fractalis-components/gb-fractalis-control/gb-fractalis-control.component';
import {GbFractalisVisualComponent} from './fractalis-components/gb-fractalis-visual/gb-fractalis-visual.component';
import {GbFractalisChartComponent} from './fractalis-components/gb-fractalis-chart/gb-fractalis-chart.component';
import {SliderModule} from 'primeng/slider';
import {GbGenericModule} from '../gb-generic-module/gb-generic.module';
import {MatIconModule} from '@angular/material/icon';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    routing,
    DragDropModule,
    TableModule,
    OverlayPanelModule,
    SelectButtonModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatChipsModule,
    SliderModule,
    GbGenericModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [
    GbAnalysisComponent, GbCrossTableComponent,
    GbDraggableCellComponent, GbDroppableZoneComponent,
    GbFractalisControlComponent,
    GbFractalisVisualComponent,
    GbFractalisChartComponent
  ]
})
export class GbAnalysisModule {
}


