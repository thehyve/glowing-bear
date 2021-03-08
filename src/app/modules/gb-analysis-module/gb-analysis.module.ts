/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule } from 'primeng'
import { routing } from './gb-analysis.routing'
import { RouterModule } from '@angular/router';
import { GbCohortLandingZoneComponent } from './panel-components/gb-cohort-landing-zone/gb-cohort-landing-zone.component';
import { GbTopComponent } from './panel-components/gb-top/gb-top.component';
import { GbSurvivalSettingsComponent } from './panel-components/gb-survival-settings/gb-survival-settings.component';
import { ButtonModule } from 'primeng';
import { SelectButtonModule } from 'primeng'
import { ToggleButtonModule } from 'primeng'
import { CardModule } from 'primeng';
import { OverlayPanelModule } from 'primeng'
import { FormsModule } from '@angular/forms'
import { TooltipModule } from 'primeng'
import { SliderModule } from 'primeng'
import { GbAnalysisComponent } from './gb-analysis.component';
import { TableModule } from 'primeng'
import { SpinnerModule } from 'primeng'
import { TabViewModule } from 'primeng'
import { DropdownModule } from 'primeng';
import { AutoCompleteModule } from 'primeng'
import { GbSelectionModule } from '../gb-explore-module/gb-selection-component/gb-selection.module';
import {ApiSurvivalAnalysisService} from '../../services/api/medco-node/api-survival-analysis.service';
import {SurvivalService} from '../../services/survival-analysis.service';
import {AnalysisService} from '../../services/analysis.service';


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

  providers: [ApiSurvivalAnalysisService, AnalysisService, SurvivalService],

  exports: [
    RouterModule
  ]
})
export class GbAnalysisModule { }
