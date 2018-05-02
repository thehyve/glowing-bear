import { Component, OnInit } from '@angular/core';
import {CrossTableService} from '../../../services/cross-table.service';
import {CrossTable} from '../../../models/table-models/cross-table';
import {Constraint} from '../../../models/constraint-models/constraint';

@Component({
  selector: 'gb-cross-table',
  templateUrl: './gb-cross-table.component.html',
  styleUrls: ['./gb-cross-table.component.css']
})
export class GbCrossTableComponent implements OnInit {

  constructor(private crossTableService: CrossTableService) {
  }

  ngOnInit() {
  }

  get crossTable(): CrossTable {
    return this.crossTableService.crossTable;
  }

  get rowConstraints(): Array<Constraint> {
    return this.crossTable.rowConstraints;
  }

  get columnConstraints(): Array<Constraint> {
    return this.crossTable.columnConstraints;
  }
}
