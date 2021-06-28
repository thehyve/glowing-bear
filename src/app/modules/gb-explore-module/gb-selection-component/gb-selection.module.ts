import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GbCombinationConstraintComponent } from '../constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import { GbConstraintComponent } from '../constraint-components/gb-constraint/gb-constraint.component';
import { GbConceptConstraintComponent } from '../constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import { GbGenomicAnnotationConstraintComponent } from '../constraint-components/gb-genomic-annotation-constraint/gb-genomic-annotation-constraint.component';
import { GbSelectionComponent } from './gb-selection.component';
import { AccordionModule, TooltipModule } from 'primeng';
import { InputNumberModule } from 'primeng';
import { DropdownModule } from 'primeng';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng';
import { CheckboxModule } from 'primeng';
import { CalendarModule } from 'primeng';
import { PanelModule } from 'primeng';
import { MultiSelectModule } from 'primeng';
import { GbTooltipComponent } from '../constraint-components/gb-concept-constraint/gb-tooltip/gb-tooltip.component';



@NgModule({
  declarations: [
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbTooltipComponent,
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ],
  imports: [
    CommonModule,
    AccordionModule,
    FormsModule,
    InputNumberModule,
    AutoCompleteModule,
    CheckboxModule,
    CalendarModule,
    DropdownModule,
    PanelModule,
    MultiSelectModule,
    TooltipModule,
  ],
  exports: [
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbTooltipComponent,
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ]
})
export class GbSelectionModule { }
