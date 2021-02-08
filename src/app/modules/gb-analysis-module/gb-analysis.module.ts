/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng/accordion'
import { routing } from './gb-analysis.routing'
import { RouterModule } from '@angular/router';
import { ApiSurvivalAnalysisService } from 'app/services/api/medco-node/api-survival-analysis.service';
import { GbCohortLandingZoneComponent } from './panel-components/gb-cohort-landing-zone/gb-cohort-landing-zone.component';
import { GbTopComponent } from './panel-components/gb-top/gb-top.component';
import { GbSurvivalSettingsComponent } from './panel-components/gb-survival-settings/gb-survival-settings.component';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton'
import { ToggleButtonModule } from 'primeng/togglebutton'
import { CardModule } from 'primeng/card';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { FormsModule } from '@angular/forms'
import { TooltipModule } from 'primeng/tooltip'
import { SliderModule } from 'primeng/slider'
import { GbAnalysisComponent } from './gb-analysis.component';
import { TableModule } from 'primeng/table'
import { SpinnerModule } from 'primeng/spinner'
import { TabViewModule } from 'primeng/tabview'
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete'
import { GbSelectionModule } from '../gb-explore-module/gb-selection-component/gb-selection.module';
import { SurvivalService } from 'app/services/survival-analysis.service';
import { findSourceMap } from 'module';


@NgModule({
  declarations: [
    GbCohortLandingZoneComponent,
    GbTopComponent,
    GbSurvivalSettingsComponent,
    GbAnalysisComponent
  ],
  imports: [
    AccordionModule,
    AutoCompleteModule,
    ToggleButtonModule,
    OverlayPanelModule,
    CardModule,
    TooltipModule,
    SliderModule,
    TableModule,
    CommonModule,
    FormsModule,
    SpinnerModule,
    SelectButtonModule,
    routing,
    ButtonModule,
    DropdownModule,
    TabViewModule,
    GbSelectionModule
  ],

  providers: [ApiSurvivalAnalysisService, SurvivalService],

  exports: [
    RouterModule
  ]
})
export class GbAnalysisModule { }
