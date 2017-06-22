import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExportComponent} from "./export.component";
import {routing} from './export.routing';
import {RouterModule} from "@angular/router";
import {AutoCompleteModule} from "primeng/components/autocomplete/autocomplete";
import {FormsModule} from "@angular/forms";

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [ExportComponent]
})
export class ExportModule { }
