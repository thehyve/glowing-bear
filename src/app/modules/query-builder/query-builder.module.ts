import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {QueryBuilderComponent} from "./query-builder.component";
import {routing} from './query-builder.routing';
import {RouterModule} from "@angular/router";

@NgModule({
  imports: [
    CommonModule,
    routing
  ],
  exports: [
    RouterModule
  ],
  declarations: [QueryBuilderComponent]
})
export class QueryBuilderModule { }
