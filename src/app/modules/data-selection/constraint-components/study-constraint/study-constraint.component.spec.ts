import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {StudyConstraintComponent} from './study-constraint.component';
import {AutoCompleteModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {ResourceService} from '../../../shared/services/resource.service';
import {ResourceServiceMock} from '../../../shared/mocks/resource.service.mock';
import {StudyConstraint} from '../../../shared/models/constraints/study-constraint';

describe('StudyConstraintComponent', () => {
  let component: StudyConstraintComponent;
  let fixture: ComponentFixture<StudyConstraintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StudyConstraintComponent],
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
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudyConstraintComponent);
    component = fixture.componentInstance;
    component.constraint = new StudyConstraint();
    fixture.detectChanges();
  });

  it('should create StudyConstraintComponent', () => {
    expect(component).toBeTruthy();
  });
});
