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
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';
import {DragDropModule, OverlayPanelModule, SelectButtonModule} from 'primeng/primeng';
import {GbCrossTableComponent} from './cross-table-components/gb-cross-table/gb-cross-table.component';
import {GbDraggableCellComponent} from './cross-table-components/gb-draggable-cell/gb-draggable-cell.component';
import {GbDroppableZoneComponent} from './cross-table-components/gb-droppable-zone/gb-droppable-zone.component';
import {TableModule} from 'primeng/table';
import {GbFractalisControlComponent} from './fractalis-components/gb-fractalis-control/gb-fractalis-control.component';
import {GbFractalisVisualComponent} from './fractalis-components/gb-fractalis-visual/gb-fractalis-visual.component';
import {GbFractalisChartComponent} from './fractalis-components/gb-fractalis-chart/gb-fractalis-chart.component';
import {GridsterModule} from 'angular-gridster2';
import {MatIconModule, MatButtonModule, MatExpansionModule, MatTooltipModule, MatChipsModule} from '@angular/material';


@NgModule({
  imports: [
    FormsModule,
    CommonModule,
    routing,
    DragDropModule,
    TableModule,
    OverlayPanelModule,
    SelectButtonModule,
    GridsterModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatTooltipModule,
    MatChipsModule
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


