import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbAnalysisComponent} from './gb-analysis.component';
import {routing} from './gb-analysis.routing';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [GbAnalysisComponent]
})
export class GbAnalysisModule {
}


