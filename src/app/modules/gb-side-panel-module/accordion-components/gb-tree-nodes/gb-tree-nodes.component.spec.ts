import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbTreeNodesComponent} from './gb-tree-nodes.component';
import {AutoCompleteModule, DragDropModule, OverlayPanelModule, TreeModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ResourceService} from '../../../../services/resource.service';
import {ResourceServiceMock} from '../../../../services/mocks/resource.service.mock';
import {QueryService} from '../../../../services/query.service';
import {QueryServiceMock} from '../../../../services/mocks/query.service.mock';

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
          provide: ResourceService,
          useClass: ResourceServiceMock
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
    fixture = TestBed.createComponent(GbTreeNodesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
