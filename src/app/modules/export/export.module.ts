import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExportComponent} from "./export.component";
import {routing} from './export.routing';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [ExportComponent]
})
export class ExportModule { }
