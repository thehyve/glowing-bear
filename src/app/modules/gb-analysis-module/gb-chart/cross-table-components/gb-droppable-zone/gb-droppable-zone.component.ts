/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, Input, OnInit} from '@angular/core';
import {Constraint} from '../../../../../models/constraint-models/constraint';
import {CrossTableService} from '../../../../../services/cross-table.service';
import {MessageHelper} from '../../../../../utilities/message-helper';
import {AxisType} from '../../../../../models/table-models/axis-type';
import {ConceptConstraint} from '../../../../../models/constraint-models/concept-constraint';
import {VariableService} from '../../../../../services/variable.service';
import {ConstraintHelper} from '../../../../../utilities/constraint-utilities/constraint-helper';
import {ConstraintSerialiser} from '../../../../../utilities/constraint-utilities/constraint-serialiser';

@Component({
  selector: 'gb-droppable-zone',
  templateUrl: './gb-droppable-zone.component.html',
  styleUrls: ['./gb-droppable-zone.component.css']
})
export class GbDroppableZoneComponent implements OnInit {
  @Input() constraints: Constraint[] = [];
  @Input() axis: AxisType = null;
  @Input() disabled = false;

  public dragCounter = 0;

  constructor(private crossTableService: CrossTableService,
              private variableService: VariableService) {
  }

  ngOnInit() {
  }

  onDragEnter(e: DragEvent) {
    if (this.dragCounter < 0) {
      this.dragCounter = 0;
    }
    const selectedConstraintCell = this.crossTableService.selectedConstraintCell;
    const constraint = selectedConstraintCell ? selectedConstraintCell.constraint : null;
    if (constraint) {
      const index = this.constraints.indexOf(constraint);
      if (index === -1) {
        this.dragCounter++;
      }
    } else {
      this.dragCounter++;
    }
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.dragCounter--;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    const selectedConstraintCell = this.crossTableService.selectedConstraintCell;
    let constraint = selectedConstraintCell ? selectedConstraintCell.constraint : null;
    // if no existing constraint (from one of the already created draggable cells) is used,
    // try to create a new one based on the (possible) variable drop
    if (this.disabled) {
      // do nothing, data loading is in progress
    } else if (!constraint) {
      let variable = this.variableService.identifyDraggedElement();
      if (variable) {
        constraint = new ConceptConstraint();
        (<ConceptConstraint>constraint).concept = variable;
        if (constraint && this.crossTableService.isValidConstraint(constraint)) {
          constraint.textRepresentation = ConstraintHelper.brief(constraint);
          this.constraints.push(constraint);
          // new constraint is introduced, creating new header constraints as well as cells
          this.crossTableService.update(this.constraints);
        } else {
          const summary = 'Not a valid constraint, please choose a categorical concept!';
          MessageHelper.alert('error', summary);
          console.error(summary, ConstraintSerialiser.serialise(constraint));
        }
      }
    } else {
      const index = this.constraints.indexOf(constraint);
      if (index === -1) {
        // old constraint is dropped to the other drop zone,
        // no need to call backend to update value aggregates and cells
        // just update the rows and cols based on existing cells
        this.constraints.push(constraint);
        selectedConstraintCell.remove();
      } else {
        // own constraint is dropped to the same zone, re-ordering action
        // do nothing for now, possible extension:
      }
    }
    // reset
    this.dragCounter = 0;
    this.crossTableService.selectedConstraintCell = null;
  }

  /**
   * Remove the selected constraint from the list
   * @param {Constraint} constraint
   */
  onConstraintCellRemoved(constraint: Constraint) {
    const index = this.constraints.indexOf(constraint);
    if (index > -1) {
      this.constraints.splice(index, 1);
    }
    this.crossTableService.updateCells();
  }

  get variablesDragDropScope(): string {
    return this.variableService.variablesDragDropScope;
  }
}
