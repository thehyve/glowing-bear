import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';
import {DragDropModule} from 'primeng/primeng';
import {GbCrossTableComponent} from './gb-cross-table/gb-cross-table.component';
import {GbDraggableCellComponent} from './gb-draggable-cell/gb-draggable-cell.component';
import {GbDroppableZoneComponent} from './gb-droppable-zone/gb-droppable-zone.component';
import {TableModule} from 'primeng/table';

@NgModule({
  imports: [
    CommonModule,
    routing,
    DragDropModule,
    TableModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [GbAnalysisComponent, GbCrossTableComponent, GbDraggableCellComponent, GbDroppableZoneComponent]
})
export class GbAnalysisModule {
}


