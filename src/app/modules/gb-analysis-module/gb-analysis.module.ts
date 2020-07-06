import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionModule} from 'primeng/accordion'
import { routing } from './gb-analysis.routing'
import { RouterModule } from '@angular/router';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { SurvivalAnalysisService } from 'app/services/api/survival-analysis.service';
import { GbSurvivalComponent } from './panel-components/gb-survival-res/gb-survival.component';
import { GbCohortLandingZoneComponent } from './panel-components/gb-cohort-landing-zone/gb-cohort-landing-zone.component';
import { GbTopComponent } from './panel-components/gb-top/gb-top.component';
import { GbSurvivalSettingsComponent } from './panel-components/gb-survival-settings/gb-survival-settings.component';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton'
import { ToggleButtonModule } from 'primeng/togglebutton'
import { CardModule} from 'primeng/card';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { FormsModule} from '@angular/forms'
import { SliderModule } from 'primeng/slider'
import { GbAnalysisComponent } from './gb-analysis.component';
import { GbChartContainerComponent } from './panel-components/gb-chart-container/gb-chart-container.component'
import { TableModule } from 'primeng/table'
import { SpinnerModule, Spinner } from 'primeng/spinner'
import { TabViewModule } from 'primeng/tabview'
import { DropdownModule } from 'primeng/dropdown';
import { GbSubgroupComponent } from './panel-components/gb-subgroup/gb-subgroup.component';
import { GbSelectionModule } from '../gb-explore-module/gb-selection-component/gb-selection.module';





/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
@NgModule({
  declarations: [GbSurvivalComponent,
    GbCohortLandingZoneComponent,
    GbTopComponent,
    GbSurvivalSettingsComponent,
    GbAnalysisComponent,
    GbChartContainerComponent,
    GbSubgroupComponent],
  imports: [
    AccordionModule,
    ToggleButtonModule,
    OverlayPanelModule,
    CardModule,
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

  providers:[SurvivalAnalysisService,SurvivalAnalysisServiceMock],

  exports:[
    RouterModule
  ]
})
export class GbAnalysisModule { }
