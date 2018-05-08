import {Component, ElementRef, Input, OnInit} from '@angular/core';
import {Constraint} from '../../../models/constraint-models/constraint';
import {CrossTableService} from '../../../services/cross-table.service';

@Component({
  selector: 'gb-droppable-zone',
  templateUrl: './gb-droppable-zone.component.html',
  styleUrls: ['./gb-droppable-zone.component.css']
})
export class GbDroppableZoneComponent implements OnInit {

  @Input() constraints: Array<Constraint> = [];
  public dragCounter = 0;

  constructor(private crossTableService: CrossTableService) {
  }

  ngOnInit() {
  }

  onDragEnter(e) {
    if (this.dragCounter < 0) {
      this.dragCounter = 0;
    }
    let selection = this.crossTableService.selectedConstraintCell.constraint;
    const index = this.constraints.indexOf(selection);
    if (selection && index === -1) {
      this.dragCounter++;
    }
  }

  onDrop(e) {
    let selection = this.crossTableService.selectedConstraintCell.constraint;
    const index = this.constraints.indexOf(selection);
    if (selection && index === -1) {
      this.constraints.push(selection);
      this.crossTableService.selectedConstraintCell.remove();
      this.dragCounter = 0;
    }
    this.crossTableService.update();
  }

  onDragLeave(e) {
    e.preventDefault();
    this.dragCounter--;
  }

  /**
   * Remove the selected cosntraint from the list
   * @param {Constraint} constraint
   */
  onConstraintCellRemoved(constraint: Constraint) {
    const index = this.constraints.indexOf(constraint);
    if (index > -1) {
      this.constraints.splice(index, 1);
    }
  }

  get dragDropContext(): string {
    return this.crossTableService.PrimeNgDragAndDropContext;
  }

}
