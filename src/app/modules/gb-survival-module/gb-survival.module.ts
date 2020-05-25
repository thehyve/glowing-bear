import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GbSurvivalComponent } from './gb-survival.component';
import { routing } from './gb-survival.routing'
import { RouterModule } from '@angular/router';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis.service';
import { SurvivalAnalysisService } from 'app/services/api/survival-analysis.service';




@NgModule({
  declarations: [GbSurvivalComponent],
  imports: [
    CommonModule,
    routing
  ],

  providers:[SurvivalAnalysisService,SurvivalAnalysisServiceMock],

  exports:[
    RouterModule
  ]
})
export class GbSurvivalModule { }
