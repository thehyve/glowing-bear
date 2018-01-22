import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbSidePanelComponent} from './gb-side-panel.component';
import {CommonModule} from '@angular/common';
import {
  AccordionModule, AutoCompleteModule, ButtonModule, ConfirmationService, ConfirmDialogModule, DataListModule,
  DragDropModule, InputTextModule, OverlayPanelModule, PanelModule,
  TooltipModule, TreeModule, RadioButtonModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {GbTreeNodesComponent} from './accordion-components/gb-tree-nodes/gb-tree-nodes.component';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {TreeNodeServiceMock} from '../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../services/tree-node.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {GbQueriesComponent} from './accordion-components/gb-queries/gb-queries.component';
import {QueryService} from '../../services/query.service';
import {QueryServiceMock} from '../../services/mocks/query.service.mock';
import {Md2AccordionModule} from 'md2';

describe('GbSidePanelComponent', () => {
  let component: GbSidePanelComponent;
  let fixture: ComponentFixture<GbSidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbSidePanelComponent,
        GbTreeNodesComponent,
        GbQueriesComponent
      ],
      imports: [
        BrowserAnimationsModule,
        CommonModule,
        AccordionModule,
        TreeModule,
        OverlayPanelModule,
        DataListModule,
        DragDropModule,
        FormsModule,
        AutoCompleteModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        ConfirmDialogModule,
        Md2AccordionModule,
        RadioButtonModule
      ],
      providers: [
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
        },
        {
          provide: QueryService,
          useClass: QueryServiceMock
        },
        ConfirmationService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbSidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create GbSidePanelComponent', () => {
    expect(component).toBeTruthy();
  });
});
