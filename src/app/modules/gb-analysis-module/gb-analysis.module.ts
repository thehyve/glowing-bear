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
import { FormsModule} from '@angular/forms'
import {SliderModule} from 'primeng/slider'
import { GbAnalysisComponent } from './gb-analysis.component';
import { GbChartContainerComponent } from './panel-components/gb-chart-container/gb-chart-container.component'
import {TableModule} from 'primeng/table'




@NgModule({
  declarations: [GbSurvivalComponent,
    GbCohortLandingZoneComponent,
    GbTopComponent,
    GbSurvivalSettingsComponent,
    GbAnalysisComponent,
    GbChartContainerComponent],
  imports: [
    CardModule,
    SliderModule,
    TableModule,
    CommonModule,
    FormsModule,
    routing,
    ButtonModule
  ],

  providers:[SurvivalAnalysisService,SurvivalAnalysisServiceMock],

  exports:[
    RouterModule
  ]
})
export class GbAnalysisModule { }
