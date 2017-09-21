import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DataSelectionComponent } from './data-selection.component';
import {AutoCompleteModule, CalendarModule, CheckboxModule, TreeModule} from 'primeng/primeng';
import {Md2AccordionModule} from 'md2';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {EndpointService} from '../../services/endpoint.service';
import {EndpointServiceMock} from '../../services/mocks/endpoint.service.mock';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {DimensionRegistryServiceMock} from '../../services/mocks/dimension-registry.service.mock';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {routing} from './data-selection.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {GenericComponentMock} from '../../services/mocks/generic.component.mock';

describe('DataSelectionComponent', () => {
  let component: DataSelectionComponent;
  let fixture: ComponentFixture<DataSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        DataSelectionComponent,
        GenericComponentMock({selector: 'patient-selection'}),
        GenericComponentMock({selector: 'observation-selection'}),
        GenericComponentMock({selector: 'data-view'}),
        GenericComponentMock({selector: 'data-summary'})
      ],
      imports: [
        BrowserAnimationsModule,
        routing,
        CommonModule,
        FormsModule,
        AutoCompleteModule,
        Md2AccordionModule,
        CheckboxModule,
        CalendarModule,
        TreeModule
      ],
      providers: [
        {
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
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
    fixture = TestBed.createComponent(DataSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DataSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
