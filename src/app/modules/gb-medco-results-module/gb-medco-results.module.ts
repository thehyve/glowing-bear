/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbMedcoResultsComponent} from './gb-medco-results.component';
import {routing} from './gb-medco-results.routing';
import {ChartModule} from "primeng/chart";
import {TableModule} from "primeng/table";

@NgModule({
  imports: [
    CommonModule,
    routing,
    ChartModule,
    TableModule
  ],
  declarations: [GbMedcoResultsComponent],
  exports: [GbMedcoResultsComponent]
})
export class GbMedcoResultsModule {
}
