import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConceptConstraintComponent} from './gb-concept-constraint.component';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule} from 'primeng/primeng';
import {DimensionRegistryService} from '../../../../services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../../services/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConceptConstraint} from '../../../../models/constraints/concept-constraint';

describe('GbConceptConstraintComponent', () => {
  let component: GbConceptConstraintComponent;
  let fixture: ComponentFixture<GbConceptConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConceptConstraintComponent
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
    fixture = TestBed.createComponent(GbConceptConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new ConceptConstraint();
    fixture.detectChanges();
  });

  it('should create GbConceptConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
