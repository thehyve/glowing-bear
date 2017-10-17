import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TreeNodesComponent} from './tree-nodes.component';
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
  let component: TreeNodesComponent;
  let fixture: ComponentFixture<TreeNodesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TreeNodesComponent],
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
    fixture = TestBed.createComponent(TreeNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create TreeNodesComponent', () => {
    expect(component).toBeTruthy();
  });
});
