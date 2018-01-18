import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDataSelectionComponent} from './gb-data-selection.component';
import {
  AutoCompleteModule, CalendarModule, CheckboxModule, TreeModule, MessagesModule,
  TooltipModule
} from 'primeng/primeng';
import {Md2AccordionModule} from 'md2';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {EndpointService} from '../../services/endpoint.service';
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

describe('GbDataSelectionComponent', () => {
  let component: GbDataSelectionComponent;
  let fixture: ComponentFixture<GbDataSelectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDataSelectionComponent,
<<<<<<< HEAD
        MockComponent({selector: 'gb-selection'}),
        MockComponent({selector: 'gb-projection'}),
        MockComponent({selector: 'gb-export'})
=======
        MockComponent({ selector: 'gb-selection' }),
        MockComponent({ selector: 'gb-projection' }),
        MockComponent({ selector: 'gb-export' })
>>>>>>> fit tests with new typescript by using a mock-component library
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
          provide: EndpointService,
          useClass: EndpointServiceMock
        },
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

  it('should create GbDataSelectionComponent', () => {
    expect(component).toBeTruthy();
  });
});
