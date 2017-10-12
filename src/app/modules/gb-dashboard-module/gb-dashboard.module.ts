import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbDashboardComponent} from './gb-dashboard.component';
import {RouterModule} from '@angular/router';
import {routing} from './gb-dashboard.routing';

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [GbDashboardComponent]
})
export class GbDashboardModule {
}
