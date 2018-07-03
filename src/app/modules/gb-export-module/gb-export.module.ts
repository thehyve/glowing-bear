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
import {CheckboxModule, DataTableModule, MessagesModule} from 'primeng/primeng';
import {routing} from './gb-export.routing';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    CheckboxModule,
    DataTableModule,
    MessagesModule
  ],
  declarations: [GbExportComponent],
  exports: [GbExportComponent]
})
export class GbExportModule {
}
