import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { OverlayPanelModule } from 'primeng/overlaypanel'
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { SpinnerModule } from 'primeng/spinner';
import { routing } from './gb-survival-results.routing'
import { GbSurvivalResultsComponent } from './gb-survival-results.component';



@NgModule({
  declarations: [GbSurvivalResultsComponent],
  imports: [
    FormsModule,
    AccordionModule,
    CommonModule,
    OverlayPanelModule,
    routing,
    DropdownModule,
    ButtonModule,
    SpinnerModule,
  ]
})
export class GbSurvivalResultsModule {

}
