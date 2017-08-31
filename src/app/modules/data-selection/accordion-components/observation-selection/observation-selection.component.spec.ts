import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ObservationSelectionComponent} from './observation-selection.component';
import {TreeModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ResourceService} from '../../../shared/services/resource.service';
import {ResourceServiceMock} from '../../../shared/mocks/resource.service.mock';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';

describe('ObservationSelectionComponent', () => {
  let component: ObservationSelectionComponent;
  let fixture: ComponentFixture<ObservationSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ObservationSelectionComponent],
      imports: [
        FormsModule,
        TreeModule
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
    fixture = TestBed.createComponent(ObservationSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ObservationSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
