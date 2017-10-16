import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {GbSidePanelComponent} from './gb-side-panel.component';
import {AccordionModule} from 'primeng/components/accordion/accordion';
import {TreeModule} from 'primeng/components/tree/tree';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {TreeNodesComponent} from './accordion-components/tree-nodes/tree-nodes.component';
import {TreeDragDropService} from 'primeng/components/common/api';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {QueriesComponent} from './accordion-components/queries/queries.component';
import {DragDropModule} from 'primeng/components/dragdrop/dragdrop';
import {AutoCompleteModule, ButtonModule, InputTextModule, PanelModule, TooltipModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';

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
    TooltipModule
  ],
  declarations: [
    GbSidePanelComponent,
    TreeNodesComponent,
    QueriesComponent
  ],
  providers: [TreeDragDropService],
  exports: [GbSidePanelComponent]
})
export class GbSidePanelModule {
}
