import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Constraint} from '../../../models/constraint-models/constraint';
import {CrossTableService} from '../../../services/cross-table.service';
import {TreeNodeService} from '../../../services/tree-node.service';
import {ConstraintService} from '../../../services/constraint.service';
import {DropMode} from '../../../models/drop-mode';
import {ConstraintHelper} from '../../../utilities/constraints/constraint-helper';

@Component({
  selector: 'gb-droppable-zone',
  templateUrl: './gb-droppable-zone.component.html',
  styleUrls: ['./gb-droppable-zone.component.css']
})
export class GbDroppableZoneComponent implements OnInit {

  @Input() constraints: Array<Constraint> = [];
  public dragCounter = 0;

  constructor(private crossTableService: CrossTableService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService) {
  }

  ngOnInit() {
  }

  onDragEnter(e) {
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

  onDragLeave(e) {
    e.preventDefault();
    this.dragCounter--;
  }

  onDrop() {
    const selectedConstraintCell = this.crossTableService.selectedConstraintCell;
    let constraint = selectedConstraintCell ? selectedConstraintCell.constraint : null;
    // if no existing constraint is used, try to create a new one based on tree node drop
    if (!constraint) {
      if (this.treeNodeService.selectedTreeNode) {
        constraint = this.constraintService
          .generateConstraintFromTreeNode(this.treeNodeService.selectedTreeNode, DropMode.TreeNode);
        if (constraint && this.crossTableService.isValidConstraint(constraint)) {
          constraint.textRepresentation = ConstraintHelper.brief(constraint);
          this.constraints.push(constraint);
          // new constraint is introduced, creating new header constraints as well as cells
          this.crossTableService.updateValueConstraints(this.constraints);
        } else {
          console.error('Not a valid constraint', constraint);
        }
      }
    } else {
      const index = this.constraints.indexOf(constraint);
      if (index === -1) {
        // old constraint is dropped to the other drop zone,
        // no need to call backend to update value aggregates and cells
        // just update the rows and cols based on existing cells
        this.constraints.push(constraint);
        if (selectedConstraintCell) {
          selectedConstraintCell.remove();
        }
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
   * @param {any} onlyUpdateHeaders - indicate if to update the cells or just the headers
   * @param {Constraint} constraint
   */
  onConstraintCellRemoved(constraint: Constraint) {
    const index = this.constraints.indexOf(constraint);
    if (index > -1) {
      this.constraints.splice(index, 1);
    }
    this.crossTableService.updateCells();
  }

  get dragDropContext(): string {
    return this.crossTableService.PrimeNgDragAndDropContext;
  }

}
