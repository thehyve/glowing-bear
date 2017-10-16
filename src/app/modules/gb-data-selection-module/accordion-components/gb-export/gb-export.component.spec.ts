import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbExportComponent} from './gb-export.component';
import {
  AutoCompleteModule, CheckboxModule, DataListModule, DataTableModule, DropdownModule, FieldsetModule, MessagesModule,
  PanelModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {SimpleTimer} from 'ng2-simple-timer';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

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
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
    fixture = TestBed.createComponent(GbExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbExportComponent', () => {
    expect(component).toBeTruthy();
  });
});
