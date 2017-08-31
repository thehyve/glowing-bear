import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {PatientSelectionComponent} from './patient-selection.component';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';
import {FormsModule} from '@angular/forms';
import {AutoCompleteModule, CalendarModule, CheckboxModule} from 'primeng/primeng';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../shared/services/resource.service';
import {ResourceServiceMock} from '../../../shared/mocks/resource.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GenericComponentMock} from '../../../shared/mocks/generic.component.mock';

describe('PatientSelectionComponent', () => {
  let component: PatientSelectionComponent;
  let fixture: ComponentFixture<PatientSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        PatientSelectionComponent,
        GenericComponentMock({selector: 'constraint', inputs: ['constraint', 'isRoot']})
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        AutoCompleteModule,
        CheckboxModule,
        CalendarModule,
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
    fixture = TestBed.createComponent(PatientSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create PatientSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
