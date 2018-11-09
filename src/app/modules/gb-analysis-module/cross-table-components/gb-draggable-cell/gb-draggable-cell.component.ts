/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Constraint} from '../../../../models/constraint-models/constraint';
import {CrossTableService} from '../../../../services/cross-table.service';

@Component({
  selector: 'gb-draggable-cell',
  templateUrl: './gb-draggable-cell.component.html',
  styleUrls: ['./gb-draggable-cell.component.css']
})
export class GbDraggableCellComponent implements OnInit {

  @Input() constraint: Constraint;
  @Output() constraintCellRemoved: EventEmitter<any> = new EventEmitter();

  constructor(private crossTableService: CrossTableService) { }

  ngOnInit() {
  }

  remove() {
    this.constraintCellRemoved.emit();
  }

  onDragStart(e) {
    this.crossTableService.selectedConstraintCell = this;
  }

  get dragDropContext(): string {
    return this.crossTableService.PrimeNgDragAndDropContext;
  }
}
