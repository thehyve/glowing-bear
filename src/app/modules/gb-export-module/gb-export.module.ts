import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbExportComponent} from './gb-export.component';
import {FormsModule} from '@angular/forms';
import {CheckboxModule, DataTableModule, MessagesModule} from 'primeng/primeng';
import {routing} from './gb-export.routing';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    CheckboxModule,
    DataTableModule,
    MessagesModule
  ],
  declarations: [GbExportComponent],
  exports: [GbExportComponent]
})
export class GbExportModule {
}
