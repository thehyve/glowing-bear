import {Component, Input, OnInit} from '@angular/core';
import {Constraint} from '../../../models/constraint-models/constraint';

@Component({
  selector: 'gb-draggable-cell',
  templateUrl: './gb-draggable-cell.component.html',
  styleUrls: ['./gb-draggable-cell.component.css']
})
export class GbDraggableCellComponent implements OnInit {

  @Input() constraint: Constraint;

  constructor() { }

  ngOnInit() {
  }

}
