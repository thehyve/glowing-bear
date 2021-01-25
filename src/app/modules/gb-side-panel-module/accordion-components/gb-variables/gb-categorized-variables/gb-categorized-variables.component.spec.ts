import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {GbCategorizedVariablesComponent} from './gb-categorized-variables.component';
import {CheckboxModule, DragDropModule} from 'primeng';
import {FormsModule} from '@angular/forms';
import {NavbarService} from '../../../../../services/navbar.service';
import {NavbarServiceMock} from '../../../../../services/mocks/navbar.service.mock';
import {VariableService} from '../../../../../services/variable.service';
import {VariableServiceMock} from '../../../../../services/mocks/variable.service.mock';
import {TreeNodeService} from '../../../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../../../services/mocks/tree-node.service.mock';
import {GbTreeNode} from '../../../../../models/tree-node-models/gb-tree-node';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatButtonModule} from '@angular/material/button';

describe('GbCategorizedVariablesComponent', () => {
  let component: GbCategorizedVariablesComponent;
  let fixture: ComponentFixture<GbCategorizedVariablesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbCategorizedVariablesComponent
      ],
      imports: [
        FormsModule,
        CheckboxModule,
        MatButtonModule,
        MatExpansionModule,
        DragDropModule
      ],
      providers: [
        {
          provide: NavbarService,
          useClass: NavbarServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock,
        },
        {
          provide: VariableService,
          useClass: VariableServiceMock,
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbCategorizedVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show highlighted variables first', () => {
    const node1: GbTreeNode = {
      type: 'CATEGORICAL',
      name: 'B',
    };
    const node2: GbTreeNode = {
      type: 'CATEGORICAL',
      name: 'A',
    };
    const node3: GbTreeNode = {
      type: 'CATEGORICAL',
      name: 'C',
    };

    expect(component.highlightedVariablesFirst([node1, node2, node3])).toEqual([node2, node1, node3]);

    node1.styleClass = 'gb-highlight-treenode';
    node3.styleClass = 'gb-highlight-treenode';

    expect(component.highlightedVariablesFirst([node1, node2, node3])).toEqual([node1, node3, node2]);

    node2.styleClass = 'gb-highlight-treenode';

    expect(component.highlightedVariablesFirst([node1, node2, node3])).toEqual([node2, node1, node3]);
  });
});
