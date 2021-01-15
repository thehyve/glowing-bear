import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GbCombinationConstraintComponent } from '../constraint-components/gb-combination-constraint/gb-combination-constraint.component';
import { GbConstraintComponent } from '../constraint-components/gb-constraint/gb-constraint.component';
import { GbConceptConstraintComponent } from '../constraint-components/gb-concept-constraint/gb-concept-constraint.component';
import { GbGenomicAnnotationConstraintComponent } from '../constraint-components/gb-genomic-annotation-constraint/gb-genomic-annotation-constraint.component';
import { GbSelectionComponent } from './gb-selection.component';
import { AccordionModule } from 'primeng/components/accordion/accordion';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';



@NgModule({
  declarations: [
    GbCombinationConstraintComponent,
    GbConstraintComponent,
    GbConceptConstraintComponent,
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ],
  imports: [
    CommonModule,
    AccordionModule,
    FormsModule,
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
    GbGenomicAnnotationConstraintComponent,
    GbSelectionComponent
  ]
})
export class GbSelectionModule { }
