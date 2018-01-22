import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbConstraintComponent} from './gb-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {StudyConstraint} from '../../../../models/constraints/study-constraint';
import {ConceptConstraint} from '../../../../models/constraints/concept-constraint';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {QueryService} from '../../../../services/query.service';
import {MockComponent} from 'ng2-mock-component';

describe('GbConstraintComponent', () => {
  let component: GbConstraintComponent;
  let fixture: ComponentFixture<GbConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbConstraintComponent,
        MockComponent({selector: 'gb-combination-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-study-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-concept-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-patient-set-constraint', inputs: ['constraint']}),
        MockComponent({selector: 'gb-pedigree-constraint', inputs: ['constraint']})
      ],
      providers: [
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
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
