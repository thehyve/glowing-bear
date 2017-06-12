import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidePanelComponent} from "./side-panel.component";
import {AccordionModule} from "primeng/components/accordion/accordion";
import {TreeModule} from "primeng/components/tree/tree";
import {TreeNodesComponent} from './accordion-components/tree-nodes/tree-nodes.component';
import {TreeDragDropService} from "primeng/components/common/api";
import {OverlayPanelModule} from "primeng/components/overlaypanel/overlaypanel";

@NgModule({
  imports: [
    CommonModule,
    AccordionModule,
    TreeModule,
    OverlayPanelModule
  ],
  declarations: [SidePanelComponent, TreeNodesComponent],
  providers: [TreeDragDropService],
  exports: [SidePanelComponent]
})
export class SidePanelModule {
}
