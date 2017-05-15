import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SidePanelComponent} from "./side-panel.component";
import {AccordionModule} from "primeng/components/accordion/accordion";

@NgModule({
  imports: [
    CommonModule,
    AccordionModule
  ],
  declarations: [SidePanelComponent],
  exports: [SidePanelComponent]
})
export class SidePanelModule {
}
