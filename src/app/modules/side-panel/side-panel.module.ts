import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidePanelComponent} from './side-panel.component';
import {AccordionModule} from 'primeng/components/accordion/accordion';
import {TreeModule} from 'primeng/components/tree/tree';
import {DataListModule} from 'primeng/components/datalist/datalist';
import {TreeNodesComponent} from './accordion-components/tree-nodes/tree-nodes.component';
import {TreeDragDropService} from 'primeng/components/common/api';
import {OverlayPanelModule} from 'primeng/components/overlaypanel/overlaypanel';
import {SavedPatientSetsComponent} from './accordion-components/saved-patient-sets/saved-patient-sets.component';
import {DragDropModule} from 'primeng/components/dragdrop/dragdrop';
import {AutoCompleteModule, ButtonModule, InputTextModule, PanelModule, TooltipModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {SavedObservationSetsComponent} from './accordion-components/saved-observation-sets/saved-observation-sets.component';

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
    SidePanelComponent,
    TreeNodesComponent,
    SavedPatientSetsComponent,
    SavedObservationSetsComponent
  ],
  providers: [TreeDragDropService],
  exports: [SidePanelComponent]
})
export class SidePanelModule {
}
