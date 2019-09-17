/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ElementRef, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Constraint} from '../../../../models/constraint-models/constraint';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {CombinationConstraint} from '../../../../models/constraint-models/combination-constraint';
import {CohortService} from '../../../../services/cohort.service';
import {StudyService} from '../../../../services/study.service';
import {AuthenticationService} from '../../../../services/authentication/authentication.service';

@Component({
  selector: 'gb-constraint',
  templateUrl: './gb-constraint.component.html',
  styleUrls: ['./gb-constraint.component.css']
})
export class GbConstraintComponent implements OnInit {
  @Input() constraint: Constraint;
  @Input() isRoot: boolean;
  @Output() constraintRemoved: EventEmitter<any> = new EventEmitter();

  constructor(protected authService: AuthenticationService,
              protected treeNodeService: TreeNodeService,
              protected resourceService: ResourceService,
              protected constraintService: ConstraintService,
              protected cohortService: CohortService,
              protected studyService: StudyService,
              public element: ElementRef) {
  }

  ngOnInit() {
    this.addEventListeners();
  }

  /**
   * Emits the constraintRemoved event, indicating the constraint corresponding
   * to this component is to be removed from its parent.
   */
  remove() {
    this.constraintRemoved.emit();
  }

  addEventListeners() {
    let elm: Element = this.element.nativeElement;
    elm.addEventListener('dragenter', this.onDragEnter.bind(this), false);
    elm.addEventListener('dragover', this.onDragOver.bind(this), false);
    elm.addEventListener('dragleave', this.onDragLeave.bind(this), false);
    // capture the event in its capturing phase, instead of the bubbling phase
    // so that parent constraint component handles the event first
    elm.addEventListener('drop', this.onDrop.bind(this), true);
  }

  onDragEnter(event) {
    event.stopPropagation();
    event.preventDefault();
    this.element.nativeElement.firstChild.classList.add('dropzone');
  }

  onDragOver(event) {
    event.stopPropagation();
    event.preventDefault();
    this.element.nativeElement.firstChild.classList.add('dropzone');
  }

  onDragLeave(event) {
    this.element.nativeElement.firstChild.classList.remove('dropzone');
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.element.nativeElement.firstChild.classList.remove('dropzone');
  }

  update() {
    if (this.cohortService.instantCohortCountsUpdate) {
      this.cohortService.updateCountsWithCurrentCohort();
    } else {
      this.cohortService.isDirty = true;
    }
  }

  get constraintDepth(): number {
    return this.constraint.depth;
  }

  get isRootClassLevel(): boolean {
    return this.constraint.className === 'CombinationConstraint'
      && (<CombinationConstraint>this.constraint).isRoot;
  }

  get observationBoxMessage(): string {
    let parentDimension = this.constraint.parentDimension;
    if (this.constraint.negated) {
      return `for the ${parentDimension} there is NO observation:`;
    } else {
      return `for the ${parentDimension} there is an observation:`;
    }
  }

  get showObservationBoxMessage(): boolean {
    return !this.isRoot && this.constraint.className !== 'CombinationConstraint'
      && this.constraint.className !== 'PedigreeConstraint'
  }

}
