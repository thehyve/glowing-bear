/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbExportComponent} from './gb-export.component';
import {FormsModule} from '@angular/forms';
import {CheckboxModule, DataTableModule, MessagesModule, PickListModule, TooltipModule} from 'primeng/primeng';
import {routing} from './gb-export.routing';
import {GbDataTableComponent} from "../gb-cohort-selection-module/accordion-components/gb-data-table/gb-data-table.component";
import {GbDataTableDimensionsComponent} from "./data-table-components/gb-data-table-dimensions/gb-data-table-dimensions.component";
import {GbDataTableGridComponent} from "./data-table-components/gb-data-table-grid/gb-data-table-grid.component";
import {TableModule} from "primeng/table";

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    CheckboxModule,
    DataTableModule,
    MessagesModule,
    PickListModule,
    TableModule,
    TooltipModule
  ],
  declarations: [
    GbExportComponent,
    GbDataTableComponent,
    GbDataTableDimensionsComponent,
    GbDataTableGridComponent
  ],
  exports: [GbExportComponent]
})
export class GbExportModule {
}
