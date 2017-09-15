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
import {SavedPatientSetsComponent} from './accordion-components/saved-patient-sets/saved-patient-sets.component';
import {SavedObservationSetsComponent} from './accordion-components/saved-observation-sets/saved-observation-sets.component';
import {ConstraintService} from '../shared/services/constraint.service';
import {ConstraintServiceMock} from '../shared/mocks/constraint.service.mock';
import {DimensionRegistryServiceMock} from '../shared/mocks/dimension-registry.service.mock';
import {DimensionRegistryService} from '../shared/services/dimension-registry.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('SidePanelComponent', () => {
  let component: SidePanelComponent;
  let fixture: ComponentFixture<SidePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        SidePanelComponent,
        TreeNodesComponent,
        SavedPatientSetsComponent,
        SavedObservationSetsComponent
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
