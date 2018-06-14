import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbMainComponent} from './gb-main.component';
import {GbNavBarModule} from '../gb-navbar-module/gb-navbar.module';
import {GbSidePanelModule} from '../gb-side-panel-module/gb-side-panel.module';
import {routing} from './gb-main.routing';
import {RouterModule} from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    routing,
    GbNavBarModule,
    GbSidePanelModule
  ],
  declarations: [GbMainComponent],
  exports: [GbMainComponent, RouterModule]
})
export class GbMainModule {
}
