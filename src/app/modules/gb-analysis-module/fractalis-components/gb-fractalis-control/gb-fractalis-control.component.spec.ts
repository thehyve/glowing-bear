import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbFractalisControlComponent} from './gb-fractalis-control.component';
import {FractalisService} from '../../../../services/fractalis.service';
import {FractalisServiceMock} from '../../../../services/mocks/fractalis.service.mock';
import {DragDropModule, SelectButtonModule} from 'primeng';
import {FormsModule} from '@angular/forms';
import {Concept} from '../../../../models/constraint-models/concept';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {TreeNodeServiceMock} from '../../../../services/mocks/tree-node.service.mock';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {TreeNode} from 'primeng/api';
import {By} from '@angular/platform-browser';
import {GbGenericModule} from '../../../gb-generic-module/gb-generic.module';
import {VariableService} from '../../../../services/variable.service';
import {VariableServiceMock} from '../../../../services/mocks/variable.service.mock';
import {MatIconModule} from '@angular/material/icon';
import {MatChipsModule} from '@angular/material/chips';

describe('GbFractalisControlComponent', () => {
  let component: GbFractalisControlComponent;
  let fixture: ComponentFixture<GbFractalisControlComponent>;
  let fractalisService: FractalisService;
  let variableService: VariableService;
  let treeNodeService: TreeNodeService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [GbFractalisControlComponent],
      imports: [
        FormsModule,
        SelectButtonModule,
        DragDropModule,
        MatIconModule,
        MatChipsModule,
        GbGenericModule
      ],
      providers: [
        {
          provide: FractalisService,
          useClass: FractalisServiceMock
        },
        {
          provide: TreeNodeService,
          useClass: TreeNodeServiceMock
        },
        {
          provide: VariableService,
          useClass: VariableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fractalisService = TestBed.inject(FractalisService);
    variableService = TestBed.inject(VariableService);
    treeNodeService = TestBed.inject(TreeNodeService);
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
    component.onDropVariable(new DragEvent(''));
    expect(component.dragCounter).toBe(0);
    expect(component.selectedVariables.length).toBe(1);
    expect(component.isValidationError).toBe(false);
    expect(component.validationErrorMessages.length).toBe(0);
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
    component.selectedChartType = ChartType.BOXPLOT;
    let spy1 = spyOn(fractalisService, 'clearValidation').and.callThrough();
    component.onDropVariable(new DragEvent(''));

    expect(component.dragCounter).toBe(0);
    expect(spy1).toHaveBeenCalled();
    expect(component.selectedVariables.length).toBe(1);
  });

  it('should identify tree node dragged', () => {
    treeNodeService.selectedTreeNode = {} as TreeNode;
    component.selectedChartType = ChartType.BOXPLOT;
    let spy1 = spyOn(fractalisService, 'clearValidation').and.callThrough();
    let spy2 = spyOn(variableService, 'identifyDraggedElement').and.callThrough();
    component.onDropVariable(new DragEvent(''));

    expect(component.dragCounter).toBe(0);
    expect(spy1).toHaveBeenCalled();
    expect(spy2).toHaveBeenCalled();
    expect(component.selectedVariables.length).toBe(1);
  });

  it('should not show variables drop zone for cross table', () => {
    component.selectedChartType = ChartType.CROSSTABLE;
    let dateColumnSelector = fixture.debugElement.query(By.css('.drop-zone'));
    expect(dateColumnSelector).toBeNull();
  });
});
