/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbMainComponent} from './gb-main.component';
import {GbNavBarModule} from '../gb-navbar-module/gb-navbar.module';
import {GbSidePanelModule} from '../gb-side-panel-module/gb-side-panel.module';
import {routing} from './gb-main.routing';
import {RouterModule} from '@angular/router';
import { GbSurvivalModule } from '../gb-survival-module/gb-survival.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    GbNavBarModule,
    GbSidePanelModule,
    GbSurvivalModule
  ],
  declarations: [GbMainComponent],
  exports: [GbMainComponent, RouterModule]
})
export class GbMainModule {
}
