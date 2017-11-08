import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTreeNodesComponent} from './gb-tree-nodes.component';
import {AutoCompleteModule, DragDropModule, OverlayPanelModule, TreeModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {ConstraintService} from '../../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';

describe('TreeNodesComponent', () => {
  let component: GbTreeNodesComponent;
  let fixture: ComponentFixture<GbTreeNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbTreeNodesComponent],
      imports: [
        BrowserAnimationsModule,
        TreeModule,
        OverlayPanelModule,
        DragDropModule,
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
    fixture = TestBed.createComponent(GbTreeNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create TreeNodesComponent', () => {
    expect(component).toBeTruthy();
  });
});
