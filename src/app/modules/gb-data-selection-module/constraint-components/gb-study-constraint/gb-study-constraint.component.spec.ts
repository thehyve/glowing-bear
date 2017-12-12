import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbStudyConstraintComponent} from './gb-study-constraint.component';
import {AutoCompleteModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {StudyConstraint} from '../../../../models/constraints/study-constraint';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {QueryService} from '../../../../services/query.service';

describe('GbStudyConstraintComponent', () => {
  let component: GbStudyConstraintComponent;
  let fixture: ComponentFixture<GbStudyConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbStudyConstraintComponent],
      imports: [
        FormsModule,
        AutoCompleteModule
      ],
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
    fixture = TestBed.createComponent(GbStudyConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new StudyConstraint();
    fixture.detectChanges();
  });

  it('should create GbStudyConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
