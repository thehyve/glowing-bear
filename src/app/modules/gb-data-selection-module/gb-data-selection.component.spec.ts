import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataSelectionComponent} from './gb-data-selection.component';
import {
  AutoCompleteModule, CalendarModule, CheckboxModule, TreeModule, MessagesModule,
  TooltipModule
} from 'primeng/primeng';
import {Md2AccordionModule} from 'md2';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {EndpointServiceMock} from '../../services/mocks/endpoint.service.mock';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../services/tree-node.service';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {routing} from './gb-data-selection.routing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {MockComponent} from 'ng2-mock-component';
import {DataTableService} from '../../services/data-table.service';
import {DataTableServiceMock} from '../../services/mocks/data-table.service.mock';
import {MessageServiceMock} from '../../services/mocks/message.service.mock';
import {MessageService} from '../../services/message.service';

describe('GbDataSelectionComponent', () => {
  let component: GbDataSelectionComponent;
  let fixture: ComponentFixture<GbDataSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDataSelectionComponent,
        MockComponent({selector: 'gb-selection'}),
        MockComponent({selector: 'gb-projection'}),
        MockComponent({selector: 'gb-data-table'})
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
        TreeModule,
        MessagesModule,
        TooltipModule
      ],
      providers: [
        {
          provide: ResourceService,
          useClass: ResourceServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        {
          provide: DataTableService,
          useClass: DataTableServiceMock
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
    fixture = TestBed.createComponent(GbDataSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
