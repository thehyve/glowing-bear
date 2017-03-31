import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DataSelectionComponent} from "./data-selection.component";
import {routing} from './data-selection.routing';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [DataSelectionComponent]
})
export class DataSelectionModule { }
