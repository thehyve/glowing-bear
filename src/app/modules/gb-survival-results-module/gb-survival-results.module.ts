import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
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
