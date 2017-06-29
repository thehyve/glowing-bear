import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ExportComponent} from "./export.component";
import {routing} from './export.routing';
import {RouterModule} from "@angular/router";
import {AutoCompleteModule} from "primeng/components/autocomplete/autocomplete";
import {FormsModule} from "@angular/forms";
import {DataListModule} from "primeng/components/datalist/datalist";
import {CheckboxModule} from "primeng/components/checkbox/checkbox";
import {FieldsetModule} from "primeng/components/fieldset/fieldset";
import {DataTableModule} from "primeng/components/datatable/datatable";
import {SharedModule} from "primeng/components/common/shared";

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    DataListModule,
    CheckboxModule,
    FieldsetModule,
    DataTableModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ],
  declarations: [ExportComponent]
})
export class ExportModule { }
