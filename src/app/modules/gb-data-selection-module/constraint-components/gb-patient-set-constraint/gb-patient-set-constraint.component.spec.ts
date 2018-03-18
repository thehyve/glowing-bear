import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {GbPatientSetConstraintComponent} from './gb-patient-set-constraint.component';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {PatientSetConstraint} from '../../../../models/constraint-models/patient-set-constraint';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';

describe('GbPatientSetConstraintComponent', () => {
  let component: GbPatientSetConstraintComponent;
  let fixture: ComponentFixture<GbPatientSetConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbPatientSetConstraintComponent],
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
    fixture = TestBed.createComponent(GbPatientSetConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new PatientSetConstraint();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
