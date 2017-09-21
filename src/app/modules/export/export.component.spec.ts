import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ExportComponent} from './export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {routing} from './export.routing';
import {CommonModule} from '@angular/common';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {DimensionRegistryServiceMock} from '../../services/mocks/dimension-registry.service.mock';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {ResourceService} from '../../services/resource.service';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {SimpleTimer} from 'ng2-simple-timer';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ExportComponent', () => {
  let component: ExportComponent;
  let fixture: ComponentFixture<ExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExportComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        routing,
        FormsModule,
        AutoCompleteModule,
        DataListModule,
        CheckboxModule,
        FieldsetModule,
        DataTableModule,
        PanelModule,
        DropdownModule,
        MessagesModule
      ],
      providers: [
        SimpleTimer,
        {
          provide: DimensionRegistryService,
          useClass: DimensionRegistryServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ExportComponent', () => {
    expect(component).toBeTruthy();
  });
});
