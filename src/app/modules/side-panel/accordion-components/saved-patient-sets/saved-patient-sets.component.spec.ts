import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SavedPatientSetsComponent} from './saved-patient-sets.component';
import {ButtonModule, DataListModule, DragDropModule, InputTextModule, PanelModule, TooltipModule} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DimensionRegistryService} from '../../../shared/services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../../shared/mocks/dimension-registry.service.mock';
import {ConstraintServiceMock} from '../../../shared/mocks/constraint.service.mock';
import {ConstraintService} from '../../../shared/services/constraint.service';
import {FormsModule} from '@angular/forms';

describe('SavedPatientSetsComponent', () => {
  let component: SavedPatientSetsComponent;
  let fixture: ComponentFixture<SavedPatientSetsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavedPatientSetsComponent],
      imports: [
        BrowserAnimationsModule,
        DataListModule,
        DragDropModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        FormsModule
      ],
      providers: [
        {
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
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
    fixture = TestBed.createComponent(SavedPatientSetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SavedPatientSetsComponent', () => {
    expect(component).toBeTruthy();
  });
});
