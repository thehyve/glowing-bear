import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CombinationConstraintComponent} from './combination-constraint.component';
import {GenericComponentMock} from '../../../shared/mocks/generic.component.mock';
import {AutoCompleteModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../shared/services/resource.service';
import {ResourceServiceMock} from '../../../shared/mocks/resource.service.mock';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';
import {CombinationConstraint} from '../../../shared/models/constraints/combination-constraint';

describe('CombinationConstraintComponent', () => {
  let component: CombinationConstraintComponent;
  let fixture: ComponentFixture<CombinationConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        CombinationConstraintComponent,
        GenericComponentMock({selector: 'constraint', inputs: ['constraint']})
      ],
      imports: [
        FormsModule,
        AutoCompleteModule
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
    fixture = TestBed.createComponent(CombinationConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new CombinationConstraint();
    fixture.detectChanges();
  });

  it('should create CombinationConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
