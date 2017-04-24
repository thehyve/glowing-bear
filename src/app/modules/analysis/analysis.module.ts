import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {AnalysisComponent} from "./analysis.component";
import {routing} from './analysis.routing';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [AnalysisComponent]
})
export class AnalysisModule { }
