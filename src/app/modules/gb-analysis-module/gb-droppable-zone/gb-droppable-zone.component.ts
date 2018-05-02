import {Component, Input, OnInit} from '@angular/core';
import {Constraint} from '../../../models/constraint-models/constraint';

@Component({
  selector: 'gb-droppable-zone',
  templateUrl: './gb-droppable-zone.component.html',
  styleUrls: ['./gb-droppable-zone.component.css']
})
export class GbDroppableZoneComponent implements OnInit {

  @Input() constraints: Array<Constraint> = [];

  constructor() { }

  ngOnInit() {
  }

  onDragEnter(e) {
    console.log('drag enter', e);
  }

  onDrop(e) {
    console.log(' drop', e);
  }

  onDragLeave(e) {
    console.log(' drag leave', e);
  }
}
