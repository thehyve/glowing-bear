import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ConceptConstraintComponent} from './concept-constraint.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule} from 'primeng/primeng';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../shared/services/resource.service';
import {ResourceServiceMock} from '../../../shared/mocks/resource.service.mock';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';
import {ConceptConstraint} from '../../../shared/models/constraints/concept-constraint';

describe('ConceptConstraintComponent', () => {
  let component: ConceptConstraintComponent;
  let fixture: ComponentFixture<ConceptConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConceptConstraintComponent
      ],
      imports: [
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule
      ],
      providers: [
        {
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
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
    fixture = TestBed.createComponent(ConceptConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new ConceptConstraint();
    fixture.detectChanges();
  });

  it('should create ConceptConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
