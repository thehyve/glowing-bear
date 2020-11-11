/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { DropdownModule } from 'primeng/dropdown';
import { ScrollPanelModule } from 'primeng/scrollpanel'
import { ButtonModule } from 'primeng/button';
import { SpinnerModule } from 'primeng/spinner';
import { routing } from './gb-survival-results.routing'
import { GbSurvivalResultsComponent } from './gb-survival-results.component';



@NgModule({
  declarations: [GbSurvivalResultsComponent],
  imports: [
    FormsModule,
    AccordionModule,
    ScrollPanelModule,
    CommonModule,
    OverlayPanelModule,
    routing,
    DropdownModule,
    ButtonModule,
    SpinnerModule,
  ]
})
export class GbSurvivalResultsModule {

}
