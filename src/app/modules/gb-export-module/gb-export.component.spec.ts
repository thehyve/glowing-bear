import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ResourceService} from '../../services/resource.service';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {SimpleTimer} from 'ng2-simple-timer';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AppConfig} from '../../config/app.config';
import {AppConfigMock} from '../../config/app.config.mock';
import {ExportService} from '../../services/export.service';
import {ExportServiceMock} from '../../services/mocks/export.service.mock';
import {MessageServiceMock} from '../../services/mocks/message.service.mock';
import {MessageService} from '../../services/message.service';

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
          provide: ExportService,
          useClass: ExportServiceMock
        },
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: MessageService,
          useClass: MessageServiceMock
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

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
