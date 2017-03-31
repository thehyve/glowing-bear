import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardComponent} from "./dashboard.component";
import {routing} from './dashboard.routing';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
