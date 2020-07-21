/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {GbDraggableCellComponent} from './gb-draggable-cell.component';
import {CrossTableServiceMock} from '../../../../services/mocks/cross-table.service.mock';
import {CrossTableService} from '../../../../services/cross-table.service';
import {ConceptConstraint} from '../../../../models/constraint-models/concept-constraint';
import {Concept} from '../../../../models/constraint-models/concept';
import {CategoricalAggregate} from '../../../../models/aggregate-models/categorical-aggregate';
import {ConceptType} from '../../../../models/constraint-models/concept-type';
import {DragDropModule} from 'primeng';
import {VariableService} from '../../../../services/variable.service';
import {VariableServiceMock} from '../../../../services/mocks/variable.service.mock';

describe('GbDraggableCellComponent', () => {
  let component: GbDraggableCellComponent;
  let fixture: ComponentFixture<GbDraggableCellComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        GbDraggableCellComponent
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
    fixture = TestBed.createComponent(GbDraggableCellComponent);
    component = fixture.componentInstance;
    let concept = new Concept();
    concept.name = 'Color';
    concept.label = 'Color';
    concept.type = ConceptType.CATEGORICAL;
    let agg = new CategoricalAggregate();
    agg.valueCounts.set('red', 11);
    agg.valueCounts.set('yellow', 15);
    agg.valueCounts.set('blue', 12);
    concept.aggregate = agg;
    let cc = new ConceptConstraint();
    cc.concept = concept;
    component.constraint = cc;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
