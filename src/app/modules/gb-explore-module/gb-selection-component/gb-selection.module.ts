import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GbCombinationConstraintComponent } from '../constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import { GbConstraintComponent } from '../constraint-components/gb-constraint/gb-constraint.component';
import { GbConceptConstraintComponent } from '../constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import { GbCohortConstraintComponent } from '../constraint-components/gb-cohort-constraint/gb-cohort-constraint.component';
import { GbGenomicAnnotationConstraintComponent } from '../constraint-components/gb-genomic-annotation-constraint/gb-genomic-annotation-constraint.component';
import { GbSelectionComponent } from './gb-selection.component';
import { AccordionModule } from 'primeng';
import { InputNumberModule } from 'primeng';
import { DropdownModule } from 'primeng';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng';
import { CheckboxModule } from 'primeng';
import { CalendarModule } from 'primeng';
import { PanelModule } from 'primeng';
import { MultiSelectModule } from 'primeng';



@NgModule({
  declarations: [
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbCohortConstraintComponent,
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ],
  imports: [
    CommonModule,
    AccordionModule,
    FormsModule,
    InputNumberModule,
    AutoCompleteModule,
    DropdownModule,
    CheckboxModule,
    CalendarModule,
    DropdownModule,
    PanelModule,
    MultiSelectModule,
  ],
  exports: [
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbCohortConstraintComponent,
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ]
})
export class GbSelectionModule { }
