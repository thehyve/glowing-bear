/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbExportComponent} from './gb-export.component';
import {FormsModule} from '@angular/forms';
import {
  CheckboxModule, DataTableModule, MessagesModule, OverlayPanelModule, PickListModule,
  TooltipModule
} from 'primeng/primeng';
import {routing} from './gb-export.routing';
import {GbValidatorsModule} from '../../validators/gb-validators.module';
import {GbDataTableComponent} from './data-table-components/gb-data-table/gb-data-table.component';
import {GbDataTableDimensionsComponent} from './data-table-components/gb-data-table-dimensions/gb-data-table-dimensions.component';
import {GbDataTableGridComponent} from './data-table-components/gb-data-table-grid/gb-data-table-grid.component';
import {TableModule} from 'primeng/table';
import {MatExpansionModule} from '@angular/material';
import {GbGenericModule} from '../gb-generic-module/gb-generic.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    CheckboxModule,
    DataTableModule,
    MessagesModule,
    GbValidatorsModule,
    PickListModule,
    TableModule,
    TooltipModule,
    MatExpansionModule,
    OverlayPanelModule,
    GbGenericModule
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
