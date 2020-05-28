import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './gb-analysis.routing'
import { RouterModule } from '@angular/router';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { SurvivalAnalysisService } from 'app/services/api/survival-analysis.service';
import { GbSurvivalComponent } from './panel-components/gb-survival-res/gb-survival.component';
import { GbCohortLandingZoneComponent } from './panel-components/gb-cohort-landing-zone/gb-cohort-landing-zone.component';
import { GbTopComponent } from './panel-components/gb-top/gb-top.component';
import { GbSurvivalSettingsComponent } from './panel-components/gb-survival-settings/gb-survival-settings.component';
import { ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import { GbAnalysisComponent } from './gb-analysis.component'
import { CohortService, CohortServiceMock } from 'app/services/cohort.service';




@NgModule({
  declarations: [GbSurvivalComponent,
    GbCohortLandingZoneComponent,
    GbTopComponent,
    GbSurvivalSettingsComponent,
    GbAnalysisComponent],
  imports: [
    CardModule,
    CommonModule,
    routing,
    ButtonModule
  ],

  providers:[SurvivalAnalysisService,SurvivalAnalysisServiceMock,CohortService,CohortServiceMock],

  exports:[
    RouterModule
  ]
})
export class GbAnalysisModule { }
