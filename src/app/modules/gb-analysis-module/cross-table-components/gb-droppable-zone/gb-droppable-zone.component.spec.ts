/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {GbDroppableZoneComponent} from './gb-droppable-zone.component';
import {MockComponent} from 'ng2-mock-component';
import {CrossTableService} from '../../../../services/cross-table.service';
import {CrossTableServiceMock} from '../../../../services/mocks/cross-table.service.mock';
import {DragDropModule} from 'primeng';
import {TrueConstraint} from '../../../../models/constraint-models/true-constraint';
import {MessageHelper} from '../../../../utilities/message-helper';
import {VariableService} from '../../../../services/variable.service';
import {VariableServiceMock} from '../../../../services/mocks/variable.service.mock';
import {ConstraintHelper} from '../../../../utilities/constraint-utilities/constraint-helper';

describe('GbDroppableZoneComponent', () => {
  let component: GbDroppableZoneComponent;
  let fixture: ComponentFixture<GbDroppableZoneComponent>;
  let crossTableService: CrossTableService;
  let variableService: VariableService;

  beforeEach(waitForAsync(() => {
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
          provide: VariableService,
          useClass: VariableServiceMock
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GbDroppableZoneComponent);
    component = fixture.componentInstance;
    crossTableService = TestBed.inject(CrossTableService);
    variableService = TestBed.inject(VariableService);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should conditionally update dragCounter when sth. is dragged into the zone', () => {
    component.dragCounter = -1;
    crossTableService.selectedConstraintCell = null;
    component.onDragEnter(new DragEvent('dragenter'));
    expect(component.dragCounter).toEqual(1);

    component.dragCounter = 3;
    let dummy = new TrueConstraint();
    let spy1 = spyOnProperty(crossTableService, 'selectedConstraintCell', 'get').and.returnValue({
      constraint: dummy
    });
    component.onDragEnter(new DragEvent('dragenter'));
    expect(spy1).toHaveBeenCalled();
    expect(component.dragCounter).toEqual(4);

    component.dragCounter = 3;
    component.constraints = [dummy];
    component.onDragEnter(new DragEvent('dragenter'));
    expect(component.dragCounter).toEqual(3);
  });

  it('should update dragCounter when drag leaves', () => {
    let e = new DragEvent('dragleave');
    let spy1 = spyOn(e, 'preventDefault').and.stub();
    component.dragCounter = 6;
    component.onDragLeave(e);
    expect(spy1).toHaveBeenCalled();
    expect(component.dragCounter).toEqual(5);
  });

  it('should conditionally update cross table when a constraint cell is dropped', () => {
    let mockEvent = new DragEvent('drop');
    crossTableService.selectedConstraintCell = null;
    component.onDrop(mockEvent);
    expect(component.dragCounter).toEqual(0);
    expect(crossTableService.selectedConstraintCell).toBe(null);

    let spy = spyOn(MessageHelper, 'alert').and.stub();
    component.onDrop(mockEvent);
    expect(spy).toHaveBeenCalledTimes(1);

    let spy3 = spyOn(crossTableService, 'isValidConstraint').and.returnValue(true);
    let dummyText = 'dummy text';
    let spy4 = spyOn(ConstraintHelper, 'brief').and.returnValue(dummyText);
    component.onDrop(mockEvent);
    expect(spy3).toHaveBeenCalled();
    expect(spy4).toHaveBeenCalled();

    let dummy = new TrueConstraint();
    let dummySelectedCell = {
      constraint: dummy,
      remove: function () {
      }
    };
    let spy6 = spyOnProperty(crossTableService, 'selectedConstraintCell', 'get')
      .and.returnValue(dummySelectedCell);
    let spy7 = spyOn(dummySelectedCell, 'remove').and.stub();
    component.onDrop(mockEvent);
    expect(spy6).toHaveBeenCalled();

    component.constraints = [];
    component.onDrop(mockEvent);
    expect(component.constraints.length).toEqual(1);
    expect(component.constraints).toContain(dummy);
    expect(spy7).toHaveBeenCalled();
  });

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
  });

});
