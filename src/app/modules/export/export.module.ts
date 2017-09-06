import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ExportComponent} from './export.component';
import {routing} from './export.routing';
import {RouterModule} from '@angular/router';
import {AutoCompleteModule} from 'primeng/components/autocomplete/autocomplete';
import {FormsModule} from '@angular/forms';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {CheckboxModule} from 'primeng/components/checkbox/checkbox';
import {FieldsetModule} from 'primeng/components/fieldset/fieldset';
import {DataTableModule} from 'primeng/components/datatable/datatable';
import {SharedModule} from 'primeng/components/common/shared';
import {DropdownModule} from 'primeng/components/dropdown/dropdown';
import {SimpleTimer} from 'ng2-simple-timer';
import {PanelModule} from 'primeng/components/panel/panel';
import {MessagesModule} from 'primeng/primeng';

@NgModule({
  imports: [
    CommonModule,
    routing,
    FormsModule,
    AutoCompleteModule,
    MessagesModule,
    DataListModule,
    CheckboxModule,
    FieldsetModule,
    DataTableModule,
    PanelModule,
    DropdownModule,
    SharedModule
  ],
  exports: [
    RouterModule
  ],
  providers: [
    SimpleTimer
  ],
  declarations: [ExportComponent]
})
export class ExportModule {
}
