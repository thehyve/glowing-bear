import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbSidePanelComponent} from './gb-side-panel.component';
import {AccordionModule} from 'primeng/components/accordion/accordion';
import {TreeModule} from 'primeng/components/tree/tree';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {GbTreeNodesComponent} from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import {TreeDragDropService} from 'primeng/components/common/api';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {GbQueriesComponent} from './accordion-components/gb-queries/gb-queries.component';
import {DragDropModule} from 'primeng/components/dragdrop/dragdrop';
import {
  AutoCompleteModule,
  ButtonModule,
  ConfirmationService,
  ConfirmDialogModule,
  InputTextModule,
  PanelModule,
  RadioButtonModule,
  TooltipModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {Md2AccordionModule} from 'md2';
import {GbSummaryComponent} from './accordion-components/gb-summary/gb-summary.component';

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    TreeModule,
    OverlayPanelModule,
    DataListModule,
    DragDropModule,
    FormsModule,
    AutoCompleteModule,
    PanelModule,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    ConfirmDialogModule,
    Md2AccordionModule,
    RadioButtonModule
  ],
  declarations: [
    GbSidePanelComponent,
    GbTreeNodesComponent,
    GbQueriesComponent,
    GbSummaryComponent
  ],
  providers: [TreeDragDropService, ConfirmationService],
  exports: [GbSidePanelComponent]
})
export class GbSidePanelModule {
}
