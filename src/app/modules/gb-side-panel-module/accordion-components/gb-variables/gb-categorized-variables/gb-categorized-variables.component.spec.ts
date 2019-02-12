import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GbCategorizedVariablesComponent } from './gb-categorized-variables.component';
import {CategorizedVariable} from '../../../../../models/constraint-models/categorized-variable';
import {Concept} from '../../../../../models/constraint-models/concept';
import {ConceptType} from '../../../../../models/constraint-models/concept-type';
import {CheckboxModule, DragDropModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {MatButtonModule, MatExpansionModule} from '@angular/material';
import {NavbarService} from '../../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../../services/mocks/navbar.service.mock';
import {ConstraintServiceMock} from '../../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../../services/constraint.service';
import {DataTableService} from '../../../../../services/data-table.service';
import {DataTableServiceMock} from '../../../../../services/mocks/data-table.service.mock';

describe('GbCategorizedVariablesComponent', () => {
  let component: GbCategorizedVariablesComponent;
  let fixture: ComponentFixture<GbCategorizedVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCategorizedVariablesComponent
      ],
      imports: [
        FormsModule,
        CheckboxModule,
        MatButtonModule,
        MatExpansionModule,
        DragDropModule
      ],
      providers: [
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCategorizedVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
