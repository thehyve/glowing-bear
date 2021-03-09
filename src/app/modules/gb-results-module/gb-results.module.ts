/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */


import {NgModule} from '@angular/core';
import {AccordionModule} from 'primeng/accordion';
import {RouterModule} from '@angular/router';
import {GbResultsComponent} from './gb-results.component';
import {routing} from './gb-results.routing';
import {TabMenuModule} from 'primeng';
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [GbResultsComponent],
  exports: [
    RouterModule, GbResultsComponent
  ],
    imports: [
        AccordionModule,
        routing,
        CommonModule,
        TabMenuModule
    ]
})
export class GbResultsModule {

}
