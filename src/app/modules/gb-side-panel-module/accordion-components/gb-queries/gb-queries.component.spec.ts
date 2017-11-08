import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbQueriesComponent} from './gb-queries.component';
import {
  AutoCompleteModule, ButtonModule, DataListModule, DragDropModule, InputTextModule, PanelModule,
  TooltipModule
} from 'primeng/primeng';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {FormsModule} from '@angular/forms';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';

describe('QueriesComponent', () => {
  let component: GbQueriesComponent;
  let fixture: ComponentFixture<GbQueriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbQueriesComponent],
      imports: [
        BrowserAnimationsModule,
        DataListModule,
        DragDropModule,
        PanelModule,
        ButtonModule,
        InputTextModule,
        TooltipModule,
        FormsModule,
        AutoCompleteModule
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
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbQueriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create QueriesComponent', () => {
    expect(component).toBeTruthy();
  });
});
