import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SidePanelComponent} from './side-panel.component';
import {CommonModule} from '@angular/common';
import {
  AccordionModule, AutoCompleteModule, ButtonModule, DataListModule, DragDropModule, InputTextModule, OverlayPanelModule, PanelModule,
  TooltipModule,
  TreeModule
} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodesComponent} from './accordion-components/tree-nodes/tree-nodes.component';
import {ConstraintService} from '../../services/constraint.service';
import {ConstraintServiceMock} from '../../services/mocks/constraint.service.mock';
import {DimensionRegistryServiceMock} from '../../services/mocks/dimension-registry.service.mock';
import {DimensionRegistryService} from '../../services/dimension-registry.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceServiceMock} from '../../services/mocks/resource.service.mock';
import {ResourceService} from '../../services/resource.service';
import {QueriesComponent} from './accordion-components/queries/queries.component';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let fixture: ComponentFixture<SidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SidePanelComponent,
        TreeNodesComponent,
        QueriesComponent
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
        TooltipModule
      ],
      providers: [
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
    fixture = TestBed.createComponent(SidePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SidePanelComponent', () => {
    expect(component).toBeTruthy();
  });
});
