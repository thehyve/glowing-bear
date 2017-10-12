import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConstraintComponent} from './gb-constraint.component';
import {GenericComponentMock} from '../../../../services/mocks/generic.component.mock';
import {DimensionRegistryService} from '../../../../services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../../services/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {StudyConstraint} from '../../../../models/constraints/study-constraint';
import {ConceptConstraint} from '../../../../models/constraints/concept-constraint';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';

describe('GbConstraintComponent', () => {
  let component: GbConstraintComponent;
  let fixture: ComponentFixture<GbConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConstraintComponent,
        GenericComponentMock({selector: 'gb-combination-constraint', inputs: ['constraint']}),
        GenericComponentMock({selector: 'gb-study-constraint', inputs: ['constraint']}),
        GenericComponentMock({selector: 'gb-concept-constraint', inputs: ['constraint']})
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
    fixture = TestBed.createComponent(GbConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new StudyConstraint();
    fixture.detectChanges();
  });

  it('should create GbConstraintComponent for StudyConstraint', () => {
    component.constraint = new StudyConstraint();
    expect(component.constraint.getClassName()).toBe('StudyConstraint');
    expect(component).toBeTruthy();
  });

  it('should create GbConstraintComponent for ConceptConstraint', () => {
    component.constraint = new ConceptConstraint();
    expect(component.constraint.getClassName()).toBe('ConceptConstraint');
    expect(component).toBeTruthy();
  });

  it('should create GbConstraintComponent for CombinationConstraint', () => {
    component.constraint = new CombinationConstraint();
    expect(component.constraint.getClassName()).toBe('CombinationConstraint');
    expect(component).toBeTruthy();
  });

});
