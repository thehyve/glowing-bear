import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDroppableZoneComponent} from './gb-droppable-zone.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../services/cross-table.service';
import {CrossTableServiceMock} from '../../../services/mocks/cross-table.service.mock';
import {DragDropModule} from 'primeng/primeng';
import {TreeNodeService} from '../../../services/tree-node.service';
import {TreeNodeServiceMock} from '../../../services/mocks/tree-node.service.mock';
import {ConstraintService} from '../../../services/constraint.service';
import {ConstraintServiceMock} from '../../../services/mocks/constraint.service.mock';
import {TrueConstraint} from '../../../models/constraint-models/true-constraint';
import {MessageHelper} from '../../../utilities/message-helper';

describe('GbDroppableZoneComponent', () => {
  let component: GbDroppableZoneComponent;
  let fixture: ComponentFixture<GbDroppableZoneComponent>;
  let crossTableService: CrossTableService;
  let treeNodeService: TreeNodeService;
  let constraintService: ConstraintService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDroppableZoneComponent,
        MockComponent({selector: 'gb-draggable-cell', inputs: ['constraint']})
      ],
      imports: [
        DragDropModule
      ],
      providers: [
        {
          provide: CrossTableService,
          useClass: CrossTableServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
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
    fixture = TestBed.createComponent(GbDroppableZoneComponent);
    component = fixture.componentInstance;
    crossTableService = TestBed.get(CrossTableService);
    treeNodeService = TestBed.get(TreeNodeService);
    constraintService = TestBed.get(ConstraintService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should conditionally update dragCounter when sth. is dragged into the zone', () => {
    component.dragCounter = -1;
    crossTableService.selectedConstraintCell = null;
    component.onDragEnter({});
    expect(component.dragCounter).toEqual(1);

    component.dragCounter = 3;
    let dummy = new TrueConstraint();
    let spy1 = spyOnProperty(crossTableService, 'selectedConstraintCell', 'get').and.returnValue({
      constraint: dummy
    })
    component.onDragEnter({});
    expect(spy1).toHaveBeenCalled();
    expect(component.dragCounter).toEqual(4);

    component.dragCounter = 3;
    component.constraints = [dummy];
    component.onDragEnter({});
    expect(component.dragCounter).toEqual(3);
  })

  it('should update dragCounter when drag leaves', () => {
    let e = new Event('');
    let spy1 = spyOn(e, 'preventDefault').and.stub();
    component.dragCounter = 6;
    component.onDragLeave(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.dragCounter).toEqual(5);
  })

  it('should conditionally update cross table when a constraint cell is dropped', () => {
    crossTableService.selectedConstraintCell = null;
    treeNodeService.selectedTreeNode = null;
    component.onDrop();
    expect(component.dragCounter).toEqual(0);
    expect(crossTableService.selectedConstraintCell).toBe(null);

    treeNodeService.selectedTreeNode = {};
    let dummy = new TrueConstraint();
    let spy1 = spyOn(constraintService, 'generateConstraintFromTreeNode').and.returnValue(dummy);
    let spy2 = spyOn(MessageHelper, 'alert').and.stub();
    component.onDrop();
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalledTimes(1);

    let spy3 = spyOn(crossTableService, 'isValidConstraint').and.returnValue(true);
    let dummyText = 'dummy text';
    let spy4 = spyOn(CrossTableService, 'brief').and.returnValue(dummyText);
    let spy5 = spyOn(crossTableService, 'updateValueConstraints').and.stub();
    component.onDrop();
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();
    expect(dummy.textRepresentation).toBe(dummyText);
    expect(spy5).toHaveBeenCalled();
    expect(component.constraints).toContain(dummy);

    let dummySelectedCell = {
      constraint: dummy,
      remove: function () {
      }
    };
    let spy6 = spyOnProperty(crossTableService, 'selectedConstraintCell', 'get')
      .and.returnValue(dummySelectedCell);
    let spy7 = spyOn(dummySelectedCell, 'remove').and.stub();
    component.onDrop();
    expect(spy6).toHaveBeenCalled();

    component.constraints = [];
    component.onDrop();
    expect(component.constraints.length).toEqual(1);
    expect(component.constraints).toContain(dummy);
    expect(spy7).toHaveBeenCalled();
  })

  it('should remove selected constraint cell', () => {
    let dummy = new TrueConstraint();
    component.constraints = [];
    let spy1 = spyOn(component.constraints, 'splice').and.stub();
    let spy2 = spyOn(crossTableService, 'updateCells').and.stub();
    component.onConstraintCellRemoved(dummy);
    expect(spy1).not.toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();

    component.constraints.push(dummy);
    component.onConstraintCellRemoved(dummy);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
  })
});
