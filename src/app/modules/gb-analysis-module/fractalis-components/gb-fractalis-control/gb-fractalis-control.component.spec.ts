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

describe('GbFractalisControlComponent', () => {
  let component: GbFractalisControlComponent;
  let fixture: ComponentFixture<GbFractalisControlComponent>;
  let fractalisService: FractalisService;
  let constraintService: ConstraintService;

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
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fractalisService = TestBed.get(FractalisService);
    constraintService = TestBed.get(ConstraintService);
    fixture = TestBed.createComponent(GbFractalisControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
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
    component.onDropVariable();
    expect(component.dragCounter).toBe(0);
    expect(component.selectedVariables.length).toBe(1);
    expect(component.selectedVariables[0]).toBe(dummy);
  });

  it('should remove variable', () => {
    const dummy = new Concept();
    const dummy1 = new Concept();
    const dummy2 = new Concept();
    component.selectedVariables.push(dummy);
    component.selectedVariables.push(dummy1);
    component.onRemoveVariable(dummy2);
    expect(component.selectedVariables.length).toBe(2);

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
  });
});
