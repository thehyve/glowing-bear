import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';
import {DragDropModule} from 'primeng/primeng';
import {GbCrossTableComponent} from './gb-cross-table/gb-cross-table.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    DragDropModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [GbAnalysisComponent, GbCrossTableComponent]
})
export class GbAnalysisModule {
}


