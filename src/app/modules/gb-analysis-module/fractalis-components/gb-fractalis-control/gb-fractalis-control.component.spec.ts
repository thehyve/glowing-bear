import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbFractalisControlComponent} from './gb-fractalis-control.component';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {DragDropModule, SelectButtonModule} from 'primeng/primeng';
import {FormsModule} from '@angular/forms';
import {ConstraintServiceMock} from '../../../../services/mocks/constraint.service.mock';
import {ConstraintService} from '../../../../services/constraint.service';
import {MatChipsModule, MatIconModule} from '@angular/material';
import {Concept} from '../../../../models/constraint-models/concept';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNode} from 'primeng/api';

describe('GbFractalisControlComponent', () => {
  let component: GbFractalisControlComponent;
  let fixture: ComponentFixture<GbFractalisControlComponent>;
  let fractalisService: FractalisService;
  let constraintService: ConstraintService;
  let treeNodeService: TreeNodeService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisControlComponent],
      imports: [
        FormsModule,
        SelectButtonModule,
        DragDropModule,
        MatIconModule,
        MatChipsModule
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        },
        {
          provide: ConstraintService,
          useClass: ConstraintServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fractalisService = TestBed.get(FractalisService);
    constraintService = TestBed.get(ConstraintService);
    treeNodeService = TestBed.get(TreeNodeService);
    fixture = TestBed.createComponent(GbFractalisControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    fractalisService.variablesInvalid = true;
    fractalisService.selectedVariables = [];
    fractalisService.variablesValidationMessages = ['Variables are invalid'];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use fractalis service to add chart', () => {
    let spy = spyOn(fractalisService, 'addChart').and.stub();
    component.onAddChart();
    expect(spy).toHaveBeenCalled();
  });

  it('should keep dragCounter above 0 and increment it', () => {
    component.dragCounter = -1;
    component.onDragEnter(new DragEvent(''));
    expect(component.dragCounter).toBe(1);
    component.dragCounter = 10;
    component.onDragEnter(new DragEvent(''));
    expect(component.dragCounter).toBe(11);
  });

  it('should decrement dragCounter', () => {
    component.dragCounter = 2;
    component.onDragLeave(new DragEvent(''));
    expect(component.dragCounter).toBe(1);
  });

  it('should drop variable', () => {
    const dummy = new Concept();
    constraintService.draggedVariable = dummy;
    let spy = spyOn(fractalisService, 'validateVariableUploadStatus').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(true);
        }
      };
    });

    component.onDropVariable(new DragEvent(''));

    expect(spy).toHaveBeenCalledWith(dummy);
    expect(component.dragCounter).toBe(0);
    expect(component.selectedVariables.length).toBe(1);
    expect(component.selectedVariables[0]).toBe(dummy);
    expect(component.isValidationError).toBe(false);
    expect(component.validationErrorMessages.length).toBe(0);
  });

  it('should not drop variable if invalid', () => {
    const dummy = new Concept();
    constraintService.draggedVariable = dummy;
    let spy = spyOn(fractalisService, 'validateVariableUploadStatus').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(false);
        }
      };
    });

    component.onDropVariable(new DragEvent(''));

    expect(spy).toHaveBeenCalledWith(dummy);
    expect(component.dragCounter).toBe(0);
    expect(component.selectedVariables.length).toBe(0);
  });

  it('should remove variable', () => {
    const dummy = new Concept();
    const dummy1 = new Concept();
    const dummy2 = new Concept();
    component.selectedVariables.push(dummy);
    component.selectedVariables.push(dummy1);
    component.onRemoveVariable(dummy2);
    expect(component.selectedVariables.length).toBe(2);
    expect(component.isValidationError).toBe(false);
    expect(component.validationErrorMessages.length).toBe(0);

    component.onRemoveVariable(dummy1);
    expect(component.selectedVariables.length).toBe(1);
    expect(component.selectedVariables[0]).toBe(dummy);
  });

  it('should clear control', () => {
    component.selectedChartType = ChartType.VOLCANOPLOT;
    component.selectedVariables.push(new Concept());
    component.onClearControl();
    expect(component.selectedChartType).toBe(null);
    expect(component.selectedVariables.length).toBe(0);
    expect(component.isValidationError).toBe(false);
    expect(component.validationErrorMessages.length).toBe(0);
  });

  it('should change on select chart', () => {
    component.selectedChartType = ChartType.BOXPLOT;
    component.selectedVariables.push(new Concept());
    component.onSelectedChartTypeChange();
    expect(component.selectedVariables.length).toBe(0);
    expect(component.isValidationError).toBe(false);
    expect(component.validationErrorMessages.length).toBe(0);
  });

  it('should identify categorized variable dragged', () => {
    const dummy = new Concept();
    constraintService.draggedVariable = dummy;
    component.selectedChartType = ChartType.BOXPLOT;
    let spy1 = spyOn(fractalisService, 'clearValidation').and.callThrough();
    let spy2 = spyOn(treeNodeService, 'getConceptFromTreeNode').and.stub();
    let spy3 = spyOn(fractalisService, 'validateVariableUploadStatus').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(true);
        }
      };
    });

    component.onDropVariable(new DragEvent(''));

    expect(component.dragCounter).toBe(0);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).not.toHaveBeenCalled();
    expect(component.selectedVariables.length).toBe(1);
    expect(component.selectedVariables[0]).toBe(dummy);
  });

  it('should identify tree node dragged', () => {
    constraintService.draggedVariable = null;
    treeNodeService.selectedTreeNode = {} as TreeNode;
    component.selectedChartType = ChartType.BOXPLOT;
    let spy1 = spyOn(fractalisService, 'clearValidation').and.callThrough();
    let spy2 = spyOn(treeNodeService, 'getConceptFromTreeNode').and.callThrough();
    let spy3 = spyOn(fractalisService, 'validateVariableUploadStatus').and.callFake(function () {
      return {
        then: function (callback) {
          return callback(true);
        }
      };
    });

    component.onDropVariable(new DragEvent(''));

    expect(component.dragCounter).toBe(0);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(component.selectedVariables.length).toBe(1);
  });
});
