import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {ResourceService} from '../../services/resource.service';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {SimpleTimer} from 'ng2-simple-timer';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {TableService} from '../../services/table.service';
import {TableServiceMock} from '../../services/mocks/table.service.mock';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';

describe('GbExportComponent', () => {
  let component: GbExportComponent;
  let fixture: ComponentFixture<GbExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbExportComponent],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
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
          provide: AppConfig,
          useClass: AppConfigMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: TableService,
          useClass: TableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('GbExportComponent should be created', () => {
    expect(component).toBeTruthy();
  });
});
