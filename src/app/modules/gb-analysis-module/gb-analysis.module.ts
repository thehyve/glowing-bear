/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';
import {DragDropModule, OverlayPanelModule} from 'primeng/primeng';
import {GbCrossTableComponent} from './gb-cross-table/gb-cross-table.component';
import {GbDraggableCellComponent} from './gb-draggable-cell/gb-draggable-cell.component';
import {GbDroppableZoneComponent} from './gb-droppable-zone/gb-droppable-zone.component';
import {TableModule} from 'primeng/table';

@NgModule({
  imports: [
    CommonModule,
    routing,
    DragDropModule,
    TableModule,
    OverlayPanelModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [GbAnalysisComponent, GbCrossTableComponent, GbDraggableCellComponent, GbDroppableZoneComponent]
})
export class GbAnalysisModule {
}


