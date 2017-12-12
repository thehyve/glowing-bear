import {Component, OnInit, Input, EventEmitter, Output, ElementRef} from '@angular/core';
import {Constraint} from '../../../../models/constraints/constraint';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {ConstraintService} from '../../../../services/constraint.service';
import {ResourceService} from '../../../../services/resource.service';
import {CombinationConstraint} from '../../../../models/constraints/combination-constraint';
import {StudyConstraint} from '../../../../models/constraints/study-constraint';
import {ConceptConstraint} from '../../../../models/constraints/concept-constraint';
import {QueryService} from '../../../../services/query.service';

@Component({
  selector: 'gb-constraint',
  templateUrl: './gb-constraint.component.html',
  styleUrls: ['./gb-constraint.component.css']
})
export class GbConstraintComponent implements OnInit {
  @Input() constraint: Constraint;
  @Input() isRoot: boolean;
  @Output() constraintRemoved: EventEmitter<any> = new EventEmitter();

  constructor(protected treeNodeService: TreeNodeService,
              protected resourceService: ResourceService,
              protected constraintService: ConstraintService,
              protected queryService: QueryService,
              protected element: ElementRef) {
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
    let elm = this.element.nativeElement;
    elm.addEventListener('dragenter', this.onDragEnter.bind(this), false);
    elm.addEventListener('dragover', this.onDragOver.bind(this), false);
    elm.addEventListener('dragleave', this.onDragLeave.bind(this), false);
    elm.addEventListener('drop', this.onDrop.bind(this), false);
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

  onDrop(event) {
    event.stopPropagation();
    event.preventDefault();
    this.element.nativeElement.firstChild.classList.remove('dropzone');
    let selectedNode = this.constraintService.selectedNode;
    let droppedConstraint: Constraint =
      this.constraintService.generateConstraintFromSelectedNode(selectedNode, selectedNode['dropMode']);

    if (droppedConstraint) {
      if (this.constraint instanceof CombinationConstraint) {
        let combinationConstraint: CombinationConstraint = <CombinationConstraint>this.constraint;
        combinationConstraint.addChild(droppedConstraint);
        this.updateCounts();
      } else if (this.constraint.getClassName() === droppedConstraint.getClassName()) {
        if (this.constraint instanceof StudyConstraint) {
          let study = (<StudyConstraint>droppedConstraint).studies[0];
          let studies = (<StudyConstraint>this.constraint).studies;
          studies = studies.filter(item => item.studyId === study.studyId);
          if (studies.length === 0) {
            (<StudyConstraint>this.constraint).studies.push(study);
            this.updateCounts();
          }
        } else if (this.constraint instanceof ConceptConstraint) {
          this.constraint = droppedConstraint;
          // TODO: still needs to find a way to update the aggregates fo the ConceptConstraintComponent
          this.updateCounts();
        }
      }

    }// if dropped constraint exists
  }

  protected updateCounts() {
    this.queryService.updateCounts_1();
  }

  get containerClass(): string {
    if (this.element.nativeElement.children[0].classList.length === 0) {
      const containerClassName = (this.constraint.getClassName() === 'CombinationConstraint'
        && (<CombinationConstraint>this.constraint).isRoot) ?
        'gb-constraint-container-root ' : 'gb-constraint-container';

      let borderClassName = '';
      if (containerClassName === 'gb-constraint-container') {
        const depth = this.constraintService.depthOfConstraint(this.constraint);
        if (depth === 1) {
          borderClassName = 'gb-constraint-container-border-left-1';
        } else if (depth === 2) {
          borderClassName = 'gb-constraint-container-border-left-2';
        } else if (depth === 3) {
          borderClassName = 'gb-constraint-container-border-left-3';
        } else {
          borderClassName = 'gb-constraint-container-border-left-4';
        }
      }
      return containerClassName + ' ' + borderClassName;
    } else {
      return this.element.nativeElement.children[0].classList.value;
    }
  }

}
