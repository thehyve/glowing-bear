import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbCombinationConstraintComponent} from './gb-combination-constraint.component';
import {AutoCompleteModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';
import {MockComponent} from 'ng2-mock-component';

describe('GbCombinationConstraintComponent', () => {
  let component: GbCombinationConstraintComponent;
  let fixture: ComponentFixture<GbCombinationConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCombinationConstraintComponent,
        MockComponent({selector: 'gb-constraint', inputs: ['constraint']})
      ],
      imports: [
        FormsModule,
        AutoCompleteModule
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
    fixture = TestBed.createComponent(GbCombinationConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new CombinationConstraint();
    fixture.detectChanges();
  });

  it('should create GbCombinationConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
