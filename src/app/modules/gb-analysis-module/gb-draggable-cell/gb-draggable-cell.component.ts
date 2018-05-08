import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Constraint} from '../../../models/constraint-models/constraint';
import {CrossTableService} from '../../../services/cross-table.service';

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
